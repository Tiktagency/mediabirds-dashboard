import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Remove invisible characters and surrounding quotes from URLs
function sanitizeUrl(input: string) {
  let s = (input?.normalize?.('NFKC') ?? input) as string;
  s = s
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // control chars
    .replace(/[\u200B-\u200D\u2060\uFEFF]/g, '') // zero-width & word joiners
    .replace(/^['\"]+|['\"]+$/g, '') // strip wrapping quotes
    .replace(/\s+/g, '') // remove all whitespace/newlines
    .trim();
  return s;
}

function validateUrl(input?: string | null): string | null {
  if (!input) return null;
  try {
    const s = sanitizeUrl(input);
    const u = new URL(s);
    if (!['http:', 'https:'].includes(u.protocol)) return null;
    return s;
  } catch {
    return null;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting SEO webhook trigger");
    
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    
    // Set status to 'running'
    await supabase
      .from('automation_status')
      .upsert({
        automation_name: 'seo-research',
        status: 'running',
        last_updated: new Date().toISOString()
      }, {
        onConflict: 'automation_name'
      });
    
    // Get user ID from authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Geen autorisatie');
    }
    
    const token = authHeader.replace('Bearer ', '').trim();
    
    // Check if this is an internal call using service role key
    const isInternalCall = token === supabaseServiceKey;
    let userId: string | null = null;
    
    if (isInternalCall) {
      console.log('Internal call detected (service role key), skipping user validation');
      // userId remains null - this is allowed since notifications.user_id is nullable
    } else {
      // External call - validate user JWT
      const adminClient = createClient(supabaseUrl!, supabaseServiceKey!);
      const { data: { user }, error: userError } = await adminClient.auth.getUser(token);
      
      if (userError || !user) {
        console.error('Failed to get user:', userError);
        throw new Error('Ongeldige gebruiker');
      }
      
      userId = user.id;
    }
    
    // Parse request body
    const body = await req.json();
    const { webhookUrl, authTokenSecretName, action, formData } = body;
    
    console.log('Action:', action);
    console.log('Auth token secret name:', authTokenSecretName);
    
    // Validate webhook URL
    const validatedUrl = validateUrl(webhookUrl);
    if (!validatedUrl) {
      throw new Error('Webhook URL is ongeldig');
    }
    
    console.log('Webhook URL validated', {
      protocol: new URL(validatedUrl).protocol,
      host: new URL(validatedUrl).host,
    });
    
    // Get auth token from the specified secret
    let authToken: string | undefined;
    if (authTokenSecretName) {
      authToken = Deno.env.get(authTokenSecretName);
      if (!authToken) {
        console.error(`Auth token secret ${authTokenSecretName} not found`);
        throw new Error('Authenticatie configuratie ontbreekt');
      }
      console.log('Using auth secret:', authTokenSecretName);
    }
    
    // Create AbortController with 180 second timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 180000);

    console.log("Calling webhook");

    // Prepare request body - always send formData
    const requestBody = JSON.stringify(formData || {});

    // Call webhook with optional authentication
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (authToken) {
      headers['Authorization'] = authToken;
    }

    const response = await fetch(validatedUrl, {
      method: 'POST',
      headers,
      body: requestBody,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log(`Webhook response status: ${response.status}`);

    let message: string | null = null;
    let status = response.ok ? 'success' : 'error';
    let hasActualMessage = false;
    
    // First get the raw text, then try to parse as JSON
    const rawText = await response.text().catch(() => '');
    console.log("Webhook raw response:", rawText);
    
    if (rawText && rawText.trim().length > 0) {
      try {
        const data = JSON.parse(rawText);
        console.log("Webhook response data (parsed):", data);
        
        // Try to extract message from various possible keys
        if (data.Output) {
          message = data.Output;
          hasActualMessage = true;
        } else if (data.message && data.message !== 'Workflow was started') {
          // Ignore "Workflow was started" as it's just an acknowledgment, not final result
          message = data.message;
          hasActualMessage = true;
        } else if (data.Goed) {
          message = data.Goed;
          hasActualMessage = true;
        } else if (data.Error) {
          message = data.Error;
          status = 'error';
          hasActualMessage = true;
        } else if (data.error) {
          message = data.error;
          status = 'error';
          hasActualMessage = true;
        } else if (data.status && data.status !== 'success' && data.status !== 'ok') {
          message = data.status;
          hasActualMessage = true;
        } else if (typeof data === 'string' && data.trim().length > 0) {
          message = data;
          hasActualMessage = true;
        }
        // If it's just { message: "Workflow was started" } or similar, we don't have actual content yet
      } catch (parseError) {
        console.log("Response is not JSON, using raw text");
        // Not JSON, use the raw text as the message if it's meaningful
        if (rawText.trim().length > 0 && rawText !== 'OK' && rawText !== 'ok') {
          message = rawText;
          hasActualMessage = true;
        }
      }
    }

    // Only save notification if we have an actual message
    if (hasActualMessage && message) {
      const { error: dbError } = await supabase
        .from('notifications')
        .insert({
          message: message,
          status: status,
          user_id: userId,
        });

      if (dbError) {
        console.error("Error saving notification:", dbError);
      } else {
        console.log("Notification saved successfully");
      }
    } else {
      console.log("No actual message in response, skipping notification");
    }
    
    // Set status to 'active' on success
    await supabase
      .from('automation_status')
      .upsert({
        automation_name: 'seo-research',
        status: 'active',
        last_updated: new Date().toISOString(),
        last_run: new Date().toISOString()
      }, {
        onConflict: 'automation_name'
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: message,
        hasMessage: hasActualMessage,
        status: status 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in trigger-seo-webhook function');
    
    let errorMessage = 'Er is een fout opgetreden';
    let errorStatus = 'error';

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = 'De aanvraag duurde te lang (meer dan 3 minuten)';
        errorStatus = 'timeout';
      } else {
        errorMessage = error.message;
        console.error('Error type:', error.name);
      }
    }

    // Try to save error notification and update status
    try {
      const errorSupabaseUrl = Deno.env.get('SUPABASE_URL');
      const errorSupabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      const errorSupabase = createClient(errorSupabaseUrl!, errorSupabaseServiceKey!);
      
      // Set status to 'inactive' on error
      await errorSupabase
        .from('automation_status')
        .upsert({
          automation_name: 'seo-research',
          status: 'inactive',
          last_updated: new Date().toISOString()
        }, {
          onConflict: 'automation_name'
        });
      
      // Try to get user ID from request
      const errorAuthHeader = req.headers.get('Authorization');
      let errorUserId = null;
      
      if (errorAuthHeader) {
        try {
          const token = errorAuthHeader.replace('Bearer ', '').trim();
          const adminClient = createClient(errorSupabaseUrl!, errorSupabaseServiceKey!);
          const { data: { user } } = await adminClient.auth.getUser(token);
          errorUserId = user?.id ?? null;
        } catch {
          console.log('Could not get user ID for error notification');
        }
      }
      
      await errorSupabase
        .from('notifications')
        .insert({
          message: errorMessage,
          status: errorStatus,
          user_id: errorUserId,
        });
    } catch (dbError) {
      console.error("Error saving error notification:", dbError);
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage,
        status: errorStatus 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
