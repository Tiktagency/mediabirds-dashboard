import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
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
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { Plaatsnaam, Country, searchStringsArray } = await req.json();

    if (!Plaatsnaam || !Country || !Array.isArray(searchStringsArray) || searchStringsArray.length === 0) {
      throw new Error('Plaatsnaam, Country en minstens 1 zoekterm zijn verplicht');
    }

    const authToken = Deno.env.get('BLOG_WEBHOOK_AUTH_TOKEN');
    if (!authToken) {
      throw new Error('Auth token niet geconfigureerd');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 300_000); // 5 min

    const response = await fetch(
      'https://tikt.app.n8n.cloud/webhook/02ec49ee-d7cf-4e3e-bfba-7d71206d290b',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken,
        },
        body: JSON.stringify({ Plaatsnaam, Country, searchStringsArray }),
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    console.log(`Webhook response status: ${response.status}`);
    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch { data = text; }

    if (!response.ok) {
      const errorMsg = typeof data === 'string' ? data : (data?.message || data?.error || `Webhook returned status ${response.status}`);
      return new Response(JSON.stringify({ success: false, error: errorMsg }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update automation_status na succesvolle run
    if (response.ok) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        if (supabaseUrl && serviceRoleKey) {
          const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
          await supabaseAdmin
            .from('automation_status')
            .upsert({
              automation_name: 'leads-generator',
              status: 'active',
              last_run: new Date().toISOString(),
              last_updated: new Date().toISOString(),
            }, { onConflict: 'automation_name' });
        }
      } catch (e) {
        console.error('[trigger-leads-webhook] Failed to update automation_status:', e.message);
      }
    }

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in trigger-leads-webhook:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
