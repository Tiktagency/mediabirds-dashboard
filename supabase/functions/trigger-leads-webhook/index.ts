import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { Plaatsnaam, Country, searchStringsArray } = await req.json();

    if (!Plaatsnaam || !Country || !Array.isArray(searchStringsArray) || searchStringsArray.length === 0) {
      throw new Error('Plaatsnaam, Country en minstens 1 zoekterm zijn verplicht');
    }

    const authToken = Deno.env.get('BLOG_WEBHOOK_AUTH_TOKEN');
    if (!authToken) {
      throw new Error('Auth token niet geconfigureerd');
    }

    const response = await fetch(
      'https://tikt.app.n8n.cloud/webhook/02ec49ee-d7cf-4e3e-bfba-7d71206d290b',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken,
        },
        body: JSON.stringify({ Plaatsnaam, Country, searchStringsArray }),
      }
    );

    console.log(`Webhook response status: ${response.status}`);
    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch { data = text; }

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
