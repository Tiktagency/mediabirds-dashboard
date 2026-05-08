import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const NEWSLETTER_WEBHOOK_URL = 'https://tikt.app.n8n.cloud/webhook/f223c287-e186-4ebf-a8c1-7e9e70b0e17c';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const {
      bedrijfsnaam,
      tagline,
      bedrijfsomschrijving,
      doelgroep,
      toon,
      cta_tekst,
      cta_url,
      website,
      rss_feeds,
      primaire_kleur,
      secundaire_kleur,
      achtergrond_kleur,
      kaart_achtergrond,
      tekst_kleur,
      subtekst_kleur,
      accent_kleur,
      cta_tekst_kleur,
      footer_achtergrond,
      footer_tekst_kleur,
      settingsId,
    } = body;

    const authToken = Deno.env.get('BLOG_WEBHOOK_AUTH_TOKEN') ?? Deno.env.get('N8N_WEBHOOK_AUTH_TOKEN');

    const payload = {
      bedrijfsnaam: bedrijfsnaam || '',
      tagline: tagline || '',
      bedrijfsomschrijving: bedrijfsomschrijving || '',
      doelgroep: doelgroep || '',
      toon: toon || '',
      cta_tekst: cta_tekst || '',
      cta_url: cta_url || '',
      website: website || '',
      rss_feeds: rss_feeds || [],
      primaire_kleur: primaire_kleur || '#FF6B2C',
      secundaire_kleur: secundaire_kleur || '#1A2B5E',
      achtergrond_kleur: achtergrond_kleur || '#F5F3EF',
      kaart_achtergrond: kaart_achtergrond || '#FFFFFF',
      tekst_kleur: tekst_kleur || '#1A1A2E',
      subtekst_kleur: subtekst_kleur || '#6B7280',
      accent_kleur: accent_kleur || '#FFF0E8',
      cta_tekst_kleur: cta_tekst_kleur || '#FFFFFF',
      footer_achtergrond: footer_achtergrond || '#1A2B5E',
      footer_tekst_kleur: footer_tekst_kleur || '#E8EDF7',
      user_id: user.id,
      settings_id: settingsId || null,
    };

    // Clear any existing generated_html to signal "processing"
    if (settingsId) {
      await supabase
        .from('newsletter_companies')
        .update({ generated_html: null })
        .eq('id', settingsId);
    }

    // Fire and forget — do NOT await the webhook response
    // n8n will call back by saving to the DB via another mechanism,
    // or we handle the response async via EdgeRuntime.waitUntil
    const webhookPromise = fetch(NEWSLETTER_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { 'Authorization': authToken } : {}),
      },
      body: JSON.stringify(payload),
    }).then(async (webhookResponse) => {
      if (!webhookResponse.ok) {
        const errorText = await webhookResponse.text();
        console.error('Webhook error:', webhookResponse.status, errorText.substring(0, 200));
        return;
      }

      const responseText = await webhookResponse.text();
      let generatedHtml: string | null = null;

      try {
        const responseData = JSON.parse(responseText);
        generatedHtml = (responseData?.html || responseData?.generated_html || responseData?.content) as string | null;
      } catch {
        const trimmed = responseText.trim();
        if (trimmed.startsWith('<')) {
          generatedHtml = trimmed;
        }
      }

      if (generatedHtml && settingsId) {
        await supabase
          .from('newsletter_companies')
          .update({ generated_html: generatedHtml })
          .eq('id', settingsId);
        console.log('Newsletter HTML saved to DB for settingsId:', settingsId);
      }
    }).catch((err) => {
      console.error('Webhook fetch error:', err?.message || err);
    });

    // Use waitUntil so the background work continues after we return
    // @ts-ignore
    if (typeof EdgeRuntime !== 'undefined') {
      // @ts-ignore
      EdgeRuntime.waitUntil(webhookPromise);
    }

    // Return immediately — client will poll for the result
    return new Response(JSON.stringify({ success: true, status: 'processing' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Interne serverfout' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
