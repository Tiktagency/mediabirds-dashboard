import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PRIMARY_WEBHOOK_URL = "https://tikt.app.n8n.cloud/webhook/0d19dda2-8df2-4952-a93a-5c9c49b4edd8";

async function tryWebhook(url: string, payload: unknown, authToken?: string): Promise<{ ok: boolean; status: number; text: string; timedOut?: boolean }> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (authToken) {
    headers["Authorization"] = authToken;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 300_000);
  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const text = await response.text();
    return { ok: response.ok, status: response.status, text };
  } catch (e) {
    if ((e as any).name === "AbortError") {
      return { ok: false, status: 504, text: "Timeout: webhook gaf geen antwoord binnen 5 minuten", timedOut: true };
    }
    throw e;
  } finally {
    clearTimeout(timeoutId);
  }
}

function shouldFallback(status: number, text: string): boolean {
  if (status === 404) return true;
  if (text.includes("not registered for POST")) return true;
  return false;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Email-handtekening is toegestaan voor demo-accounts.




    const signatureData = await req.json();
    
    // Get optional auth token from environment
    const authToken = Deno.env.get("TIKT_WEBHOOK_AUTH_TOKEN") ?? 
                      Deno.env.get("N8N_WEBHOOK_AUTH_TOKEN");
    
    const attemptedUrls: string[] = [];
    let usedUrl = PRIMARY_WEBHOOK_URL;
    let result: { ok: boolean; status: number; text: string };
    
    console.log(`[trigger-email-signature] Attempting POST to: ${PRIMARY_WEBHOOK_URL}`);
    attemptedUrls.push(PRIMARY_WEBHOOK_URL);
    result = await tryWebhook(PRIMARY_WEBHOOK_URL, signatureData, authToken);
    console.log(`[trigger-email-signature] Response status: ${result.status}`);
    
    if (shouldFallback(result.status, result.text)) {
      const fallbackUrl = PRIMARY_WEBHOOK_URL.replace("/webhook-test/", "/webhook/");
      
      if (fallbackUrl !== PRIMARY_WEBHOOK_URL) {
        console.log(`[trigger-email-signature] Fallback: trying production webhook: ${fallbackUrl}`);
        attemptedUrls.push(fallbackUrl);
        result = await tryWebhook(fallbackUrl, signatureData, authToken);
        usedUrl = fallbackUrl;
        console.log(`[trigger-email-signature] Fallback response status: ${result.status}`);
      }
    }
    
    // Update automation_status if webhook was successful
    if (result.ok) {
      try {
        const supabaseAdmin = createClient(
          Deno.env.get('SUPABASE_URL')!,
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        );
        await supabaseAdmin
          .from('automation_status')
          .upsert({
            automation_name: 'email-handtekening',
            status: 'active',
            last_run: new Date().toISOString(),
            last_updated: new Date().toISOString(),
          }, { onConflict: 'automation_name' });
      } catch (e) {
        console.error('[trigger-email-signature] Failed to update automation_status:', e.message);
      }
    }

    return new Response(
      JSON.stringify({
        success: result.ok,
        status: result.status,
        rawText: result.text,
        usedUrl,
        attemptedUrls,
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("[trigger-email-signature] Error:", error.message);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        status: 500,
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
