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

function pickWebhookEnv(): { url: string; source: string } | null {
  const names = ['N8N_WEBHOOK', 'N8N_WEBHOOK_URL', 'N8N_webhook_url', 'WEBHOOK_URL'];
  for (const name of names) {
    const v = Deno.env.get(name);
    const valid = validateUrl(v);
    if (valid) return { url: valid, source: name };
  }
  return null;
}


serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    // Initialize Supabase client early for status tracking
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    
    // Set status to 'running'
    await supabase
      .from('automation_status')
      .upsert({
        automation_name: 'blogs',
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
    
    // Create admin client and get user from token
    const adminClient = createClient(supabaseUrl!, supabaseServiceKey!);
    const { data: { user }, error: userError } = await adminClient.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Ongeldige gebruiker');
    }
    
    const userId = user.id;

    // Block demo accounts from triggering automations
    const { data: isDemo } = await adminClient.rpc('is_demo_user', { _user_id: userId });
    if (isDemo) {
      return new Response(JSON.stringify({ error: 'Demo-account: automatiseringen starten is uitgeschakeld.' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Parse request body to get dynamic webhook URL, auth token secret name, and blog data
    let webhookUrl: string | null = null;
    let authTokenSecretName: string | null = null;
    let blogData: Record<string, unknown> | null = null;
    
    try {
      const body = await req.json();
      if (body.webhookUrl) {
        webhookUrl = validateUrl(body.webhookUrl);
      }
      if (body.authTokenSecretName) {
        authTokenSecretName = body.authTokenSecretName;
      }
      if (body.blogData) {
        blogData = body.blogData;
      }
    } catch {
      // No body or failed to parse body - continue with defaults
    }

    // SECURITY: only allow auth-token secret names from a fixed allowlist to prevent env exfiltration
    const ALLOWED_SECRET_NAMES = new Set([
      'BLOG_WEBHOOK_AUTH_TOKEN',
      'SEO_WEBHOOK_AUTH_TOKEN',
      'N8N_WEBHOOK_AUTH_TOKEN',
      'TIKT_WEBHOOK_AUTH_TOKEN',
    ]);
    if (authTokenSecretName && !ALLOWED_SECRET_NAMES.has(authTokenSecretName)) {
      throw new Error('Ongeldige authTokenSecretName');
    }

    // Fallback to environment variables if no webhook URL in request
    if (!webhookUrl) {
      const picked = pickWebhookEnv();
      if (picked) {
        webhookUrl = picked.url;
      }
    }

    // Get auth token - prefer the one specified in request, fallback to env vars
    let authToken: string | undefined;

    if (authTokenSecretName) {
      authToken = Deno.env.get(authTokenSecretName);
    }
    
    // Fallback to default env vars if no specific secret name provided
    if (!authToken) {
      authToken = Deno.env.get('authorization') ??
        Deno.env.get('N8N_WEBHOOK_AUTH_TOKEN') ??
        Deno.env.get('N8N_AUTH_TOKEN');
    }

    if (!webhookUrl) {
      throw new Error('Webhook URL configuratie ontbreekt of is ongeldig');
    }

    if (!authToken) {
      throw new Error('authorization configuratie ontbreekt');
    }

    // Validate that webhook URL is actually a valid URL
    try {
      const sUrl = sanitizeUrl(webhookUrl);
      const parsed = new URL(sUrl);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new Error('invalid protocol');
      }
    } catch {
      throw new Error('Webhook URL configuratie is ongeldig');
    }

    // Create AbortController with 240 second timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 240000);

    // Prepare payload - use blogData if provided, otherwise use basic payload
    const webhookPayload = blogData ? {
      ...blogData,
      triggered_from: 'edge_function',
    } : {
      timestamp: new Date().toISOString(),
      triggered_from: 'edge_function',
    };

    // Call n8n webhook with authentication
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authToken!,
      },
      body: JSON.stringify(webhookPayload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    let message = 'Geen bericht beschikbaar';
    let status = response.ok ? 'success' : 'error';
    
    try {
      const data = await response.json();
      
      // Try to extract message from various possible keys
      if (data.message) {
        message = data.message;
      } else if (data.Goed) {
        message = data.Goed;
      } else if (data.Error) {
        message = data.Error;
      } else if (data.error) {
        message = data.error;
      } else if (data.status) {
        message = data.status;
      } else if (typeof data === 'string') {
        message = data;
      } else {
        // If we can't find a message, stringify the whole response
        message = JSON.stringify(data);
      }
    } catch {
      const textResponse = await response.text().catch(() => 'no response body');
      message = textResponse || `Webhook response: ${response.status} ${response.statusText}`;
    }

    // Save notification to database
    const { error: dbError } = await supabase
      .from('notifications')
      .insert({
        message: message,
        status: status,
        user_id: userId,
      });

    if (dbError) {
      throw dbError;
    }
    
    // Set status to 'active' on success
    await supabase
      .from('automation_status')
      .upsert({
        automation_name: 'blogs',
        status: 'active',
        last_updated: new Date().toISOString(),
        last_run: new Date().toISOString()
      }, {
        onConflict: 'automation_name'
      });

    // Log workflow execution for accurate per-company tracking
    const bedrijfsnaam = blogData?.bedrijfsnaam as string | undefined;
    if (bedrijfsnaam) {
      const { data: company } = await supabase
        .from('companies')
        .select('id')
        .eq('name', bedrijfsnaam)
        .maybeSingle();
      
      if (company) {
        await supabase.from('workflow_executions').insert({
          company_id: company.id,
          workflow_type: 'seo_blog',
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
    // Log minimal info without exposing secrets
    console.error('Blog generation error');
    
    let errorMessage = 'Er is een fout opgetreden';
    let errorStatus = 'error';

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = 'De aanvraag duurde te lang (meer dan 3 minuten)';
        errorStatus = 'timeout';
      } else {
        // Only use the error message if it's a safe, user-defined message
        if (error.message && !error.message.includes('Invalid URL')) {
          errorMessage = error.message;
        }
      }
    }

    // Try to save error notification to database and update status
    try {
      const errorSupabaseUrl = Deno.env.get('SUPABASE_URL');
      const errorSupabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      const errorSupabase = createClient(errorSupabaseUrl!, errorSupabaseServiceKey!);
      
      // Set status to 'inactive' on error
      await errorSupabase
        .from('automation_status')
        .upsert({
          automation_name: 'blogs',
          status: 'inactive',
          last_updated: new Date().toISOString()
        }, {
          onConflict: 'automation_name'
        });
      
      // Try to get user ID from request for error notifications
      const errorAuthHeader = req.headers.get('Authorization');
      let errorUserId = null;
      
      if (errorAuthHeader) {
        try {
          const token = errorAuthHeader.replace('Bearer ', '').trim();
          const adminClient = createClient(
            errorSupabaseUrl!,
            errorSupabaseServiceKey!
          );
          const { data: { user } } = await adminClient.auth.getUser(token);
          errorUserId = user?.id ?? null;
        } catch {
          // Could not get user ID for error notification
        }
      }
      
      await errorSupabase
        .from('notifications')
        .insert({
          message: errorMessage,
          status: errorStatus,
          user_id: errorUserId,
        });
    } catch {
      // Error saving error notification - continue
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
