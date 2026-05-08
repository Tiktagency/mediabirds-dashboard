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
    const { companyName } = await req.json();
    if (!companyName) {
      throw new Error('companyName is verplicht');
    }

    const authToken = Deno.env.get('BLOG_WEBHOOK_AUTH_TOKEN');
    if (!authToken) {
      throw new Error('Auth token niet geconfigureerd');
    }

    const response = await fetch(
      'https://tikt.app.n8n.cloud/webhook/add1509b-90d0-4e56-87ea-1492614e3b62',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken,
        },
        body: JSON.stringify({ bedrijfsnaam: companyName }),
      }
    );

    console.log(`Webhook response status: ${response.status}`);
    await response.text();

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in trigger-add-company-webhook:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
