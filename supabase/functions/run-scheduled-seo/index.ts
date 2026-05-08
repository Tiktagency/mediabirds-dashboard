import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FIXED_SEO_WEBHOOK_URL = 'https://tikt.app.n8n.cloud/webhook/b932bfda-0727-4ff4-b311-b234be0ff953';

// Calculate the next trigger date based on schedule settings
function calculateNextTrigger(
  frequency: string,
  dayOfWeek: number,
  timeOfDay: string
): Date {
  const now = new Date();
  const [hours, minutes] = timeOfDay.split(':').map(Number);
  
  let next = new Date(now);
  next.setHours(hours, minutes, 0, 0);
  
  if (frequency === 'daily') {
    next.setDate(next.getDate() + 1);
  } else if (frequency === 'weekly') {
    next.setDate(next.getDate() + 7);
  } else if (frequency === 'biweekly') {
    next.setDate(next.getDate() + 14);
  } else if (frequency === 'monthly') {
    next.setMonth(next.getMonth() + 1);
  }
  
  return next;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all schedules that are due
    const now = new Date().toISOString();
    const { data: dueSchedules, error: fetchError } = await supabase
      .from('seo_schedules')
      .select(`
        *,
        companies (
          id,
          name
        )
      `)
      .eq('enabled', true)
      .lte('next_trigger_at', now);

    if (fetchError) {
      console.error('Error fetching schedules:', fetchError);
      throw fetchError;
    }

    if (!dueSchedules || dueSchedules.length === 0) {
      console.log('No schedules due at this time');
      return new Response(
        JSON.stringify({ success: true, message: 'No schedules due', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${dueSchedules.length} schedules to process`);

    const results: any[] = [];

    for (const schedule of dueSchedules) {
      const company = schedule.companies;
      if (!company) {
        console.error(`No company found for schedule ${schedule.id}`);
        continue;
      }

      console.log(`Processing schedule for company: ${company.name}`);

      try {
        // Fetch SEO settings for this company
        const { data: seoSettings, error: seoError } = await supabase
          .from('seo_settings')
          .select('*')
          .eq('company_id', company.id)
          .maybeSingle();

        if (seoError) {
          console.error(`Error fetching SEO settings for ${company.name}:`, seoError);
          continue;
        }

        // Get auth token
        const authToken = Deno.env.get('SEO_WEBHOOK_AUTH_TOKEN');

        // Prepare webhook payload
        const payload = {
          action: 'research',
          formData: {
            bedrijfsnaam: company.name,
            blogTopic: seoSettings?.blog_onderwerp || '',
            audienceIntent: seoSettings?.doelgroep_intentie || '',
            businessDescription: seoSettings?.bedrijfsomschrijving || '',
            extraInstructions: seoSettings?.extra_instructies || '',
          },
          triggeredBy: 'scheduled',
          scheduleId: schedule.id,
        };

        // Call the webhook
        const webhookResponse = await fetch(FIXED_SEO_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
          },
          body: JSON.stringify(payload),
        });

        const responseText = await webhookResponse.text();
        console.log(`Webhook response for ${company.name}:`, responseText);

        // Calculate next trigger
        const nextTrigger = calculateNextTrigger(
          schedule.frequency,
          schedule.day_of_week,
          schedule.time_of_day
        );

        // Update schedule with last_triggered_at and next_trigger_at
        const { error: updateError } = await supabase
          .from('seo_schedules')
          .update({
            last_triggered_at: new Date().toISOString(),
            next_trigger_at: nextTrigger.toISOString(),
          })
          .eq('id', schedule.id);

        if (updateError) {
          console.error(`Error updating schedule for ${company.name}:`, updateError);
        }

        // Log success to automation_logs
        await supabase.from('automation_logs').insert({
          automation_name: 'seo-research-scheduled',
          message: `Automatisch SEO onderzoek uitgevoerd voor ${company.name}`,
          status: webhookResponse.ok ? 'success' : 'error',
          metadata: {
            company_id: company.id,
            company_name: company.name,
            schedule_id: schedule.id,
            webhook_status: webhookResponse.status,
          },
        });

        results.push({
          company: company.name,
          success: webhookResponse.ok,
          nextTrigger: nextTrigger.toISOString(),
        });

      } catch (companyError) {
        console.error(`Error processing schedule for ${company.name}:`, companyError);
        results.push({
          company: company.name,
          success: false,
          error: companyError.message,
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: results.length,
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in run-scheduled-seo:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
