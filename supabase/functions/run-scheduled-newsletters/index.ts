import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const NEWSLETTER_WEBHOOK_URL = 'https://tikt.app.n8n.cloud/webhook/f223c287-e186-4ebf-a8c1-7e9e70b0e17c';

function calculateNextTrigger(
  intervalValue: number,
  intervalUnit: string,
  currentNextTriggerAt: string
): Date {
  const next = new Date(currentNextTriggerAt);

  if (intervalUnit === 'days') {
    next.setDate(next.getDate() + intervalValue);
  } else if (intervalUnit === 'weeks') {
    next.setDate(next.getDate() + intervalValue * 7);
  } else if (intervalUnit === 'months') {
    next.setMonth(next.getMonth() + intervalValue);
  }

  return next;
}

Deno.serve(async (req) => {
  console.log(`[run-scheduled-newsletters] Cron call received at ${new Date().toISOString()}`);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = new Date().toISOString();
    console.log(`[run-scheduled-newsletters] Checking for schedules due before: ${now}`);

    const { data: dueSchedules, error: fetchError } = await supabase
      .from('newsletter_schedules')
      .select('*')
      .eq('enabled', true)
      .lte('next_trigger_at', now);

    if (fetchError) {
      console.error('[run-scheduled-newsletters] Error fetching schedules:', fetchError);
      throw fetchError;
    }

    if (!dueSchedules || dueSchedules.length === 0) {
      console.log('[run-scheduled-newsletters] No newsletter schedules due at this time');
      return new Response(
        JSON.stringify({ success: true, message: 'No schedules due', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[run-scheduled-newsletters] Found ${dueSchedules.length} newsletter schedules to process`);

    const results: any[] = [];

    for (const schedule of dueSchedules) {
      // Fetch newsletter company details
      const { data: company, error: companyError } = await supabase
        .from('newsletter_companies')
        .select('*')
        .eq('id', schedule.company_id)
        .maybeSingle();

      if (companyError || !company) {
        console.error(`[run-scheduled-newsletters] No company for schedule ${schedule.id}:`, companyError);
        continue;
      }

      console.log(`[run-scheduled-newsletters] Processing newsletter for: ${company.name}`);

      try {
        const authToken = Deno.env.get('BLOG_WEBHOOK_AUTH_TOKEN') ?? Deno.env.get('N8N_WEBHOOK_AUTH_TOKEN');

        const payload = {
          bedrijfsnaam: company.bedrijfsnaam || company.name || '',
          tagline: company.tagline || '',
          bedrijfsomschrijving: company.bedrijfsomschrijving || '',
          doelgroep: company.doelgroep || '',
          toon: company.toon || '',
          cta_tekst: company.cta_tekst || '',
          cta_url: company.cta_url || '',
          website: company.website || '',
          rss_feeds: company.rss_feeds || [],
          primaire_kleur: company.primaire_kleur || '#FF6B2C',
          achtergrond_kleur: company.achtergrond_kleur || '#F5F3EF',
          kaart_achtergrond: company.kaart_achtergrond || '#FFFFFF',
          tekst_kleur: company.tekst_kleur || '#1A1A2E',
          subtekst_kleur: company.subtekst_kleur || '#6B7280',
          cta_tekst_kleur: company.cta_tekst_kleur || '#FFFFFF',
          footer_achtergrond: company.footer_achtergrond || '#1A2B5E',
          footer_tekst_kleur: company.footer_tekst_kleur || '#E8EDF7',
          user_id: null,
          settings_id: company.id,
          triggered_from: 'scheduled',
        };

        // 4-minuten timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 240_000);

        let webhookResponse: Response;
        try {
          webhookResponse = await fetch(NEWSLETTER_WEBHOOK_URL, {
            method: 'POST',
            signal: controller.signal,
            headers: {
              'Content-Type': 'application/json',
              ...(authToken ? { 'Authorization': authToken } : {}),
            },
            body: JSON.stringify(payload),
          });
        } catch (fetchError: any) {
          clearTimeout(timeoutId);
          if (fetchError.name === 'AbortError') {
            console.error(`[run-scheduled-newsletters] Timeout for ${company.name}`);
            results.push({ company: company.name, success: false, error: 'Timeout' });
            continue;
          }
          throw fetchError;
        }
        clearTimeout(timeoutId);

        const responseText = await webhookResponse.text();
        console.log(`[run-scheduled-newsletters] Webhook response ${webhookResponse.status} for ${company.name}`);

        const triggerSuccess = webhookResponse.ok;

        if (triggerSuccess) {
          // Parse HTML from response
          let generatedHtml: string | null = null;
          try {
            const responseData = JSON.parse(responseText);
            generatedHtml = responseData?.html || responseData?.generated_html || responseData?.content || null;
          } catch {
            const trimmed = responseText.trim();
            if (trimmed.startsWith('<')) generatedHtml = trimmed;
          }

          // Save HTML to company record
          if (generatedHtml) {
            await supabase
              .from('newsletter_companies')
              .update({ generated_html: generatedHtml })
              .eq('id', company.id);
          }

          // Advance schedule
          const intervalValue = schedule.interval_value || 1;
          const intervalUnit = schedule.interval_unit || 'weeks';
          const nextTrigger = calculateNextTrigger(intervalValue, intervalUnit, schedule.next_trigger_at);

          await supabase
            .from('newsletter_schedules')
            .update({
              last_triggered_at: new Date().toISOString(),
              next_trigger_at: nextTrigger.toISOString(),
            })
            .eq('id', schedule.id);

          results.push({ company: company.name, success: true, nextTrigger: nextTrigger.toISOString() });
        } else {
          // Failed — do NOT advance schedule, retry next run
          console.error(`[run-scheduled-newsletters] Webhook failed for ${company.name}:`, responseText.substring(0, 200));
          results.push({ company: company.name, success: false, error: responseText.substring(0, 200) });
        }
      } catch (err: any) {
        console.error(`[run-scheduled-newsletters] Error processing ${company.name}:`, err);
        results.push({ company: company.name, success: false, error: err.message });
      }
    }

    return new Response(
      JSON.stringify({ success: true, processed: results.length, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('[run-scheduled-newsletters] Fatal error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
