import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FIXED_BLOG_WEBHOOK_URL = 'https://tikt.app.n8n.cloud/webhook/491808f1-aaa2-44fb-88bf-50e0c16f17ac';

// Calculate the next trigger date by adding interval to current next_trigger_at
// This preserves the original time and prevents timezone drift
function calculateNextTrigger(
  intervalValue: number,
  intervalUnit: string,
  currentNextTriggerAt: string
): Date {
  // Start from the current scheduled time to preserve timezone/time consistency
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
  console.log(`[run-scheduled-blogs] Cron call received at ${new Date().toISOString()}`);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all schedules that are due (without embedded join to avoid relation issues)
    const now = new Date().toISOString();
    console.log(`[run-scheduled-blogs] Checking for schedules due before: ${now}`);
    
    const { data: dueSchedules, error: fetchError } = await supabase
      .from('blog_schedules')
      .select('*')
      .eq('enabled', true)
      .lte('next_trigger_at', now);

    if (fetchError) {
      console.error('[run-scheduled-blogs] Error fetching blog schedules:', fetchError);
      throw fetchError;
    }

    if (!dueSchedules || dueSchedules.length === 0) {
      console.log('[run-scheduled-blogs] No blog schedules due at this time');
      return new Response(
        JSON.stringify({ success: true, message: 'No schedules due', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[run-scheduled-blogs] Found ${dueSchedules.length} blog schedules to process`);

    const results: any[] = [];

    for (const schedule of dueSchedules) {
      // Fetch company separately to avoid relation issues
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('id, name')
        .eq('id', schedule.company_id)
        .maybeSingle();
      
      if (companyError) {
        console.error(`[run-scheduled-blogs] Error fetching company for schedule ${schedule.id}:`, companyError);
        continue;
      }
      
      if (!company) {
        console.error(`[run-scheduled-blogs] No company found for schedule ${schedule.id} (company_id: ${schedule.company_id})`);
        continue;
      }

      console.log(`[run-scheduled-blogs] Processing blog schedule for company: ${company.name} (id: ${company.id})`);

      try {
        // Fetch blog settings for this company
        const { data: blogSettings, error: blogError } = await supabase
          .from('blog_settings')
          .select('*')
          .eq('company_id', company.id)
          .maybeSingle();

        if (blogError) {
          console.error(`[run-scheduled-blogs] Error fetching blog settings for ${company.name}:`, blogError);
          continue;
        }

        if (!blogSettings) {
          console.error(`[run-scheduled-blogs] No blog settings found for ${company.name}`);
          continue;
        }

        // Prepare blog payload (same as manual trigger)
        const blogPayload = {
          bedrijfsnaam: blogSettings.bedrijfsnaam || company.name,
          bedrijfsomschrijving: blogSettings.bedrijfsomschrijving || '',
          schrijfstijl: blogSettings.schrijfstijl || '',
          aantal_woorden: blogSettings.aantal_woorden || '500-1500',
          taal: blogSettings.taal || '',
          achtergrond_kleur: blogSettings.achtergrond_kleur || '',
          hoofdaccent_gradient: blogSettings.hoofdaccent_gradient || '',
          get_afbeelding_url: blogSettings.get_afbeelding_url || '',
          post_blog_url: blogSettings.post_blog_url || '',
          status: blogSettings.status || 'Draft',
          google_sheet_id: blogSettings.google_sheet_id || '',
          google_slides_id: blogSettings.google_slides_id || '',
          category: blogSettings.category || '',
          timestamp: new Date().toISOString(),
          triggered_from: 'scheduled',
        };

        // Get auth token for blog webhook
        const authToken = Deno.env.get('BLOG_WEBHOOK_AUTH_TOKEN');

        console.log(`[run-scheduled-blogs] Calling blog webhook for ${company.name}...`);
        console.log(`[run-scheduled-blogs] Webhook URL: ${FIXED_BLOG_WEBHOOK_URL}`);
        console.log(`[run-scheduled-blogs] Payload: ${JSON.stringify(blogPayload)}`);
        
        const webhookResponse = await fetch(FIXED_BLOG_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(authToken ? { 'Authorization': authToken } : {}),
          },
          body: JSON.stringify(blogPayload),
        });

        const responseText = await webhookResponse.text();
        console.log(`[run-scheduled-blogs] Blog webhook response status: ${webhookResponse.status}`);
        console.log(`[run-scheduled-blogs] Blog webhook response for ${company.name}:`, responseText.substring(0, 500));

        // Parse the response to check if it was successful
        let triggerSuccess = webhookResponse.ok;
        let message = 'Geen bericht beschikbaar';
        
        try {
          const responseData = JSON.parse(responseText);
          if (responseData.message) {
            message = responseData.message;
          } else if (responseData.error) {
            message = responseData.error;
            triggerSuccess = false;
          }
        } catch {
          message = responseText || `Webhook response: ${webhookResponse.status}`;
        }

        if (triggerSuccess) {
          // Use new interval fields, falling back to frequency for backwards compatibility
          const intervalValue = schedule.interval_value || 1;
          const intervalUnit = schedule.interval_unit || 
            (schedule.frequency === 'daily' ? 'days' : 
             schedule.frequency === 'monthly' ? 'months' : 'weeks');
          
          // Only update schedule on success
          const nextTrigger = calculateNextTrigger(
            intervalValue,
            intervalUnit,
            schedule.next_trigger_at
          );

          const { error: updateError } = await supabase
            .from('blog_schedules')
            .update({
              last_triggered_at: new Date().toISOString(),
              next_trigger_at: nextTrigger.toISOString(),
            })
            .eq('id', schedule.id);

          if (updateError) {
            console.error(`Error updating schedule for ${company.name}:`, updateError);
          }

          // Update automation_status
          await supabase
            .from('automation_status')
            .upsert({
              automation_name: 'blogs',
              status: 'active',
              last_updated: new Date().toISOString(),
              last_run: new Date().toISOString()
            }, {
              onConflict: 'automation_name'
            });

          results.push({
            company: company.name,
            success: true,
            message,
            nextTrigger: nextTrigger.toISOString(),
          });
        } else {
          // Failed - do NOT update schedule, so it will retry next time
          console.error(`Blog trigger failed for ${company.name}:`, responseText);
          results.push({
            company: company.name,
            success: false,
            error: message,
          });
        }

      } catch (companyError) {
        console.error(`Error processing blog schedule for ${company.name}:`, companyError);
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
    console.error('Error in run-scheduled-blogs:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});