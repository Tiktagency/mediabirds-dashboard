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
    console.log("Starting blog generation trigger");
    
    // Pick first VALID webhook URL among known secret names
    const picked = pickWebhookEnv();

    const rawAuth =
      Deno.env.get('authorization') ??
      Deno.env.get('N8N_WEBHOOK_AUTH_TOKEN') ??
      Deno.env.get('N8N_AUTH_TOKEN');

    const authToken = rawAuth ?? undefined;
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    const webhookSource = picked?.source ?? 'none';

    const authSource = Deno.env.get('authorization') ? 'authorization'
      : Deno.env.get('N8N_WEBHOOK_AUTH_TOKEN') ? 'N8N_WEBHOOK_AUTH_TOKEN'
      : Deno.env.get('N8N_AUTH_TOKEN') ? 'N8N_AUTH_TOKEN'
      : 'none';

    console.log('Using webhook secret:', webhookSource);
    console.log('Using auth secret:', authSource);

    if (!picked?.url) {
      console.error('Webhook URL secret is missing or invalid');
      throw new Error('N8N_WEBHOOK configuratie ontbreekt of is ongeldig');
    }

    if (!authToken) {
      console.error('authorization secret is missing');
      throw new Error('authorization configuratie ontbreekt');
    }

    // Validate that webhook URL is actually a valid URL
    try {
      const sUrl = sanitizeUrl(picked.url);
      const parsed = new URL(sUrl);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new Error('invalid protocol');
      }
      // Minimal, non-sensitive debug info
      console.log('Webhook URL validated', {
        protocol: parsed.protocol,
        host: parsed.host,
        len: sUrl.length,
      });
    } catch {
      console.error('Webhook URL is not a valid URL');
      throw new Error('N8N_WEBHOOK configuratie is ongeldig');
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Create AbortController with 180 second timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 180000);

    console.log("Calling n8n webhook with auth header");

    // Call n8n webhook with authentication
    const response = await fetch(picked.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authToken!.startsWith('Bearer ') ? authToken! : `Bearer ${authToken!}`, // Secure auth header
        'authorization': authToken!.startsWith('Bearer ') ? authToken! : `Bearer ${authToken!}`,
      },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        triggered_from: 'edge_function',
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log(`Webhook response status: ${response.status}`);

    let message = 'Geen bericht beschikbaar';
    let status = 'success';
    
    if (response.ok) {
      const data = await response.json();
      console.log("Webhook response data:", data);
      
      if (data.message) {
        message = data.message;
      } else if (data.status) {
        message = `Status: ${data.status}`;
      }
    } else {
      status = 'error';
      message = `Webhook fout: ${response.status} ${response.statusText}`;
      console.error("Webhook error:", message);
    }

    // Save notification to database
    const { error: dbError } = await supabase
      .from('notifications')
      .insert({
        message: message,
        status: status,
      });

    if (dbError) {
      console.error("Error saving notification:", dbError);
      throw dbError;
    }

    console.log("Notification saved successfully");

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
    // NEVER log the full error as it might contain secrets
    console.error('Error in trigger-blog-generation function');
    
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
        // Log error type for debugging but not the full message
        console.error('Error type:', error.name);
      }
    }

    // Try to save error notification to database
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
      
      await supabase
        .from('notifications')
        .insert({
          message: errorMessage,
          status: errorStatus,
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
