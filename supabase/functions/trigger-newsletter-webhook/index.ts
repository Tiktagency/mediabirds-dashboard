import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

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

    // Verify user
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

    // Get webhook URL from automation_settings
    const { data: automationData } = await supabase
      .from('automation_settings')
      .select('webhook_url, webhook_backup_url, status')
      .eq('automation_name', 'nieuwsbrief')
      .single();

    const webhookUrl = automationData?.webhook_url || Deno.env.get('N8N_WEBHOOK');
    const authToken = Deno.env.get('N8N_WEBHOOK_AUTH_TOKEN');

    if (!webhookUrl) {
      return new Response(JSON.stringify({ error: 'Geen webhook URL geconfigureerd voor nieuwsbrief' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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

    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      console.error('Webhook error:', errorText);
      return new Response(JSON.stringify({ error: `Webhook fout: ${webhookResponse.status}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const responseData = await webhookResponse.json().catch(() => ({}));
    const generatedHtml = responseData?.html || responseData?.generated_html || responseData?.content || null;

    // Save generated HTML to database if available
    if (generatedHtml && settingsId) {
      await supabase
        .from('newsletter_settings')
        .update({ generated_html: generatedHtml })
        .eq('id', settingsId)
        .eq('user_id', user.id);
    }

    return new Response(JSON.stringify({ success: true, html: generatedHtml, data: responseData }), {
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
