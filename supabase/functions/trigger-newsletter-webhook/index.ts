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
      bedrijfsinformatie,
      schrijfstijl,
      rss_feeds,
      achtergrond_kleur,
      primaire_kleur,
      accent_kleur,
      settingsId,
    } = body;

    const authToken = Deno.env.get('BLOG_WEBHOOK_AUTH_TOKEN') ?? Deno.env.get('N8N_WEBHOOK_AUTH_TOKEN');

    const payload = {
      bedrijfsnaam,
      bedrijfsinformatie,
      schrijfstijl,
      rss_feeds: rss_feeds || [],
      achtergrond_kleur: achtergrond_kleur || '#ffffff',
      primaire_kleur: primaire_kleur || '#000000',
      accent_kleur: accent_kleur || '#4f46e5',
      user_id: user.id,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000);

    let webhookResponse: Response;
    try {
      webhookResponse = await fetch(NEWSLETTER_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { 'Authorization': authToken } : {}),
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      console.error('Webhook error:', errorText);
      return new Response(JSON.stringify({ error: `Webhook fout: ${webhookResponse.status}`, details: errorText }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse response: try JSON first, fall back to plain text
    const responseText = await webhookResponse.text();
    let generatedHtml: string | null = null;
    let message: string | null = null;
    let responseData: Record<string, unknown> = {};

    try {
      responseData = JSON.parse(responseText);
      generatedHtml = (responseData?.html || responseData?.generated_html || responseData?.content) as string | null;
      message = (responseData?.message || responseData?.Output) as string | null;
    } catch {
      // Plain text or HTML response
      const trimmed = responseText.trim();
      if (trimmed.startsWith('<')) {
        generatedHtml = trimmed;
      } else {
        message = trimmed;
      }
    }

    // Save generated HTML to database if available
    if (generatedHtml && settingsId) {
      await supabase
        .from('newsletter_settings')
        .update({ generated_html: generatedHtml })
        .eq('id', settingsId)
        .eq('user_id', user.id);
    }

    return new Response(JSON.stringify({ success: true, html: generatedHtml, message, data: responseData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error);
    const isTimeout = error instanceof Error && error.name === 'AbortError';
    return new Response(JSON.stringify({ error: isTimeout ? 'Timeout: nieuwsbrief genereren duurde te lang' : 'Interne serverfout' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
