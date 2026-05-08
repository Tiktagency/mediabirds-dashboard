import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FIXED_BLOG_WEBHOOK_URL = 'https://tikt.app.n8n.cloud/webhook/491808f1-aaa2-44fb-88bf-50e0c16f17ac';

// Calculate the next trigger date by adding interval to current next_trigger_at
// This preserves the original time and prevents timezone drift
function calculateNextTrigger(
  frequency: string,
  currentNextTriggerAt: string
): Date {
  // Start from the current scheduled time to preserve timezone/time consistency
  const next = new Date(currentNextTriggerAt);
  
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
      .from('blog_schedules')
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
      console.error('Error fetching blog schedules:', fetchError);
      throw fetchError;
    }

    if (!dueSchedules || dueSchedules.length === 0) {
      console.log('No blog schedules due at this time');
      return new Response(
        JSON.stringify({ success: true, message: 'No schedules due', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${dueSchedules.length} blog schedules to process`);

    const results: any[] = [];

    for (const schedule of dueSchedules) {
      const company = schedule.companies;
      if (!company) {
        console.error(`No company found for schedule ${schedule.id}`);
        continue;
      }

      console.log(`Processing blog schedule for company: ${company.name}`);

      try {
        // Fetch blog settings for this company
        const { data: blogSettings, error: blogError } = await supabase
          .from('blog_settings')
          .select('*')
          .eq('company_id', company.id)
          .maybeSingle();

        if (blogError) {
          console.error(`Error fetching blog settings for ${company.name}:`, blogError);
          continue;
        }

        if (!blogSettings) {
          console.error(`No blog settings found for ${company.name}`);
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
          timestamp: new Date().toISOString(),
          triggered_from: 'scheduled',
        };

        // Get auth token for blog webhook
        const authToken = Deno.env.get('BLOG_WEBHOOK_AUTH_TOKEN');

        console.log(`Calling blog webhook for ${company.name}`);
        
        const webhookResponse = await fetch(FIXED_BLOG_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(authToken ? { 'Authorization': authToken } : {}),
          },
          body: JSON.stringify(blogPayload),
        });

        const responseText = await webhookResponse.text();
        console.log(`Blog webhook response for ${company.name}:`, responseText);

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
          // Only update schedule on success
          const nextTrigger = calculateNextTrigger(
            schedule.frequency,
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
