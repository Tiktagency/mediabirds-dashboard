import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const WEBHOOK_URL = 'https://tikt.app.n8n.cloud/webhook/31605fee-d222-4693-accb-69e6ca4cdffd';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Require authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (userData == null || authError || !userData?.user) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const adminClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: isDemo } = await adminClient.rpc('is_demo_user', { _user_id: userData.user.id });
    if (isDemo) {
      return new Response(JSON.stringify({ success: false, error: 'Demo-account: automatiseringen starten is uitgeschakeld.' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }


    const apiKey = Deno.env.get('MONDAY_PLANNING_API_KEY') ?? Deno.env.get('TIKT_WEBHOOK_AUTH_TOKEN');
    if (!apiKey) {
      return new Response(JSON.stringify({ success: false, error: 'Webhook key not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    // Forward only the safe fields; do not let caller specify URL/headers
    const safePayload = {
      message: typeof body.message === 'string' ? body.message.slice(0, 4000) : '',
      timestamp: new Date().toISOString(),
      sender: 'user',
      bedrijfsnaam: typeof body.bedrijfsnaam === 'string' ? body.bedrijfsnaam.slice(0, 200) : undefined,
      pakket: typeof body.pakket === 'string' ? body.pakket.slice(0, 50) : undefined,
      startDatum: typeof body.startDatum === 'string' ? body.startDatum.slice(0, 30) : undefined,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300_000);
    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-KEY': apiKey },
        body: JSON.stringify(safePayload),
        signal: controller.signal,
      });
      const text = await response.text();
      return new Response(JSON.stringify({ success: response.ok, status: response.status, text }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (e) {
      const isAbort = (e as Error)?.name === 'AbortError';
      return new Response(JSON.stringify({
        success: false,
        status: isAbort ? 504 : 500,
        text: isAbort ? 'Timeout: webhook gaf geen antwoord binnen 5 minuten' : 'Webhook fout',
        timedOut: isAbort,
      }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    console.error('trigger-monday-planning error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Onbekende fout' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
