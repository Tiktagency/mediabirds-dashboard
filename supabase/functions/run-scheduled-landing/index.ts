import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LANDING_WEBHOOK_URL = 'https://tikt.app.n8n.cloud/webhook/a726f693-304a-4400-b08c-40d2748517f8';

function calculateNextTrigger(
  intervalValue: number,
  intervalUnit: string,
  currentNextTriggerAt: string
): Date {
  const next = new Date(currentNextTriggerAt);
  if (intervalUnit === 'days') {
    next.setDate(next.getDate() + intervalValue);
  } else if (intervalUnit === 'weeks') {
    next.setDate(next.getDate() + (intervalValue * 7));
  } else if (intervalUnit === 'months') {
    next.setMonth(next.getMonth() + intervalValue);
  }
  return next;
}

Deno.serve(async (req) => {
  console.log(`[run-scheduled-landing] Cron call received at ${new Date().toISOString()}`);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = new Date().toISOString();

    const { data: schedule, error: fetchError } = await supabase
      .from('landing_schedules')
      .select('*')
      .eq('enabled', true)
      .lte('next_trigger_at', now)
      .limit(1)
      .maybeSingle();

    if (fetchError) {
      console.error('[run-scheduled-landing] Error fetching schedule:', fetchError);
      throw fetchError;
    }

    if (!schedule) {
      console.log('[run-scheduled-landing] No schedule due at this time');
      return new Response(
        JSON.stringify({ success: true, message: 'No schedule due', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: companies, error: companiesError } = await supabase
      .from('landing_companies')
      .select('*')
      .order('created_at', { ascending: true });

    if (companiesError) {
      console.error('[run-scheduled-landing] Error fetching companies:', companiesError);
      throw companiesError;
    }

    if (!companies || companies.length === 0) {
      console.log('[run-scheduled-landing] No landing companies found');
      return new Response(
        JSON.stringify({ success: true, message: 'No companies to process', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const authToken = Deno.env.get('BLOG_WEBHOOK_AUTH_TOKEN');
    const results: { company: string; success: boolean; error?: string }[] = [];
    let lastCompanyId = companies[companies.length - 1].id;

    for (const company of companies) {
      console.log(`[run-scheduled-landing] Processing ${company.name} (${company.id})`);
      try {
        const webhookResponse = await fetch(LANDING_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(authToken ? { 'Authorization': authToken } : {}),
          },
          body: JSON.stringify({
            bedrijfsnaam: company.name,
            domain: company.domain,
            app_password: company.app_password || null,
            spreadsheet_id: company.spreadsheet_id || null,
            grid_id: company.grid_id || null,
            page_url: company.page_url || null,
          }),
        });

        const responseText = await webhookResponse.text();
        console.log(`[run-scheduled-landing] Response for ${company.name}: ${webhookResponse.status}`);

        if (!webhookResponse.ok) {
          console.error(`[run-scheduled-landing] Failed for ${company.name}: ${responseText.substring(0, 200)}`);
          results.push({ company: company.name, success: false, error: responseText.substring(0, 200) });
        } else {
          results.push({ company: company.name, success: true });
        }
      } catch (err) {
        console.error(`[run-scheduled-landing] Error for ${company.name}:`, err);
        results.push({ company: company.name, success: false, error: err.message });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    console.log(`[run-scheduled-landing] Done: ${successCount} succeeded, ${failCount} failed`);

    const nextTrigger = calculateNextTrigger(
      schedule.interval_value,
      schedule.interval_unit,
      schedule.next_trigger_at
    );

    await supabase
      .from('landing_schedules')
      .update({
        last_triggered_at: new Date().toISOString(),
        next_trigger_at: nextTrigger.toISOString(),
        last_processed_company_id: lastCompanyId,
      })
      .eq('id', schedule.id);

    console.log(`[run-scheduled-landing] Schedule advanced to ${nextTrigger.toISOString()}`);

    return new Response(
      JSON.stringify({ success: true, processed: results.length, successCount, failCount, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[run-scheduled-landing] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
