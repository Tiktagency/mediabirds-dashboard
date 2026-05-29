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
      const { data: isDemo } = await adminClient.rpc('is_demo_user', { _user_id: userId });
      if (isDemo) {
        return new Response(JSON.stringify({ error: 'Demo-account: automatiseringen starten is uitgeschakeld.' }), {
          status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
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
    
    // Get auth token from the specified secret (allowlist enforced)
    const ALLOWED_SECRET_NAMES = new Set([
      'BLOG_WEBHOOK_AUTH_TOKEN',
      'SEO_WEBHOOK_AUTH_TOKEN',
      'N8N_WEBHOOK_AUTH_TOKEN',
      'TIKT_WEBHOOK_AUTH_TOKEN',
    ]);
    let authToken: string | undefined;
    if (authTokenSecretName) {
      if (!ALLOWED_SECRET_NAMES.has(authTokenSecretName)) {
        throw new Error('Ongeldige authTokenSecretName');
      }
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

    let message = 'Geen bericht ontvangen';
    let status = response.ok ? 'success' : 'error';
    
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
        } else if (data.message) {
          message = data.message;
        } else if (data.Goed) {
          message = data.Goed;
        } else if (data.Error) {
          message = data.Error;
          status = 'error';
        } else if (data.error) {
          message = data.error;
          status = 'error';
        } else if (typeof data === 'string' && data.trim().length > 0) {
          message = data;
        } else {
          // Stringify hele response als fallback
          message = JSON.stringify(data);
        }
      } catch (parseError) {
        console.log("Response is not JSON, using raw text");
        // Not JSON, use the raw text as the message
        message = rawText;
      }
    }

    // ALTIJD melding opslaan
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

    // Log workflow execution for accurate per-company tracking
    const bedrijfsnaam = formData?.bedrijfsnaam as string | undefined;
    if (bedrijfsnaam) {
      const { data: company } = await supabase
        .from('companies')
        .select('id')
        .eq('name', bedrijfsnaam)
        .maybeSingle();
      
      if (company) {
        await supabase.from('workflow_executions').insert({
          company_id: company.id,
          workflow_type: 'seo_research',
          triggered_by: userId,
          success: true,
        });
        console.log(`Logged workflow execution for company: ${bedrijfsnaam}`);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: message,
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
