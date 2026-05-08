import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ALT_TEXT_WEBHOOK_URL = 'https://tikt.app.n8n.cloud/webhook/b6d054ac-4c1b-4091-8369-f3f7e1bbca72';

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
  console.log(`[run-scheduled-alt-text] Cron call received at ${new Date().toISOString()}`);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = new Date().toISOString();

    // Get the global schedule
    const { data: schedule, error: fetchError } = await supabase
      .from('alt_text_schedules')
      .select('*')
      .eq('enabled', true)
      .lte('next_trigger_at', now)
      .limit(1)
      .maybeSingle();

    if (fetchError) {
      console.error('[run-scheduled-alt-text] Error fetching schedule:', fetchError);
      throw fetchError;
    }

    if (!schedule) {
      console.log('[run-scheduled-alt-text] No schedule due at this time');
      return new Response(
        JSON.stringify({ success: true, message: 'No schedule due', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch ALL alt text companies
    const { data: companies, error: companiesError } = await supabase
      .from('alt_text_companies')
      .select('*');

    if (companiesError) {
      console.error('[run-scheduled-alt-text] Error fetching companies:', companiesError);
      throw companiesError;
    }

    if (!companies || companies.length === 0) {
      console.log('[run-scheduled-alt-text] No alt text companies found');
      return new Response(
        JSON.stringify({ success: true, message: 'No companies to process', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[run-scheduled-alt-text] Processing ${companies.length} companies`);

    const authToken = Deno.env.get('BLOG_WEBHOOK_AUTH_TOKEN');
    const results: any[] = [];
    let allSuccess = true;

    for (const company of companies) {
      try {
        console.log(`[run-scheduled-alt-text] Triggering for: ${company.name}`);

        const webhookResponse = await fetch(ALT_TEXT_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(authToken ? { 'Authorization': authToken } : {}),
          },
          body: JSON.stringify({
            bedrijfsnaam: company.name,
            domain: company.domain,
          }),
        });

        const responseText = await webhookResponse.text();
        console.log(`[run-scheduled-alt-text] Response for ${company.name}: ${webhookResponse.status}`);

        if (webhookResponse.ok) {
          results.push({ company: company.name, success: true });
        } else {
          allSuccess = false;
          results.push({ company: company.name, success: false, error: responseText.substring(0, 200) });
        }
      } catch (err) {
        allSuccess = false;
        console.error(`[run-scheduled-alt-text] Error for ${company.name}:`, err);
        results.push({ company: company.name, success: false, error: err.message });
      }
    }

    // Only advance schedule if all succeeded
    if (allSuccess) {
      const nextTrigger = calculateNextTrigger(
        schedule.interval_value,
        schedule.interval_unit,
        schedule.next_trigger_at
      );

      await supabase
        .from('alt_text_schedules')
        .update({
          last_triggered_at: new Date().toISOString(),
          next_trigger_at: nextTrigger.toISOString(),
        })
        .eq('id', schedule.id);

      console.log(`[run-scheduled-alt-text] Schedule advanced to ${nextTrigger.toISOString()}`);
    } else {
      console.log('[run-scheduled-alt-text] Not all succeeded, schedule NOT advanced');
    }

    return new Response(
      JSON.stringify({ success: true, processed: results.length, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[run-scheduled-alt-text] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
