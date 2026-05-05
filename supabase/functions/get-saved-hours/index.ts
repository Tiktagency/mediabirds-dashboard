import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const n8nApiKey = Deno.env.get('N8N_API_KEY');
    if (!n8nApiKey) {
      console.error('N8N_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'N8N API key not configured', totalHours: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client to fetch automation settings
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { workflowNames } = await req.json();
    
    if (!workflowNames || !Array.isArray(workflowNames) || workflowNames.length === 0) {
      return new Response(
        JSON.stringify({ error: 'workflowNames array is required', totalHours: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching saved hours for workflows: ${workflowNames.join(', ')}`);

    // Fetch automation settings to get time_saved_per_execution per workflow
    const { data: automationSettings, error: settingsError } = await supabase
      .from('automation_settings')
      .select('n8n_workflow_name, time_saved_per_execution');

    if (settingsError) {
      console.error('Error fetching automation settings:', settingsError);
    }

    // Create a map of workflow name to time saved per execution
    const timeSavedMap: Record<string, number> = {};
    if (automationSettings) {
      for (const setting of automationSettings) {
        if (setting.n8n_workflow_name) {
          timeSavedMap[setting.n8n_workflow_name.toLowerCase()] = setting.time_saved_per_execution || 5;
        }
      }
    }
    console.log('Time saved map:', JSON.stringify(timeSavedMap));

    // Get all workflows from n8n
    const workflowsResponse = await fetch('https://tikt.app.n8n.cloud/api/v1/workflows', {
      method: 'GET',
      headers: {
        'X-N8N-API-KEY': n8nApiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!workflowsResponse.ok) {
      const errorText = await workflowsResponse.text();
      console.error('Failed to fetch workflows:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch workflows from n8n', totalHours: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const workflowsData = await workflowsResponse.json();
    console.log(`Found ${workflowsData.data?.length || 0} workflows`);

    // Calculate date range for past 30 days
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

    let totalSavedMinutes = 0;
    let totalExecutions = 0;
    const breakdownByWorkflow: Record<string, { executions: number; minutesSaved: number; minutesPerExecution: number }> = {};

    // For each workflow name, find matching workflow and get executions
    for (const workflowName of workflowNames) {
      const workflow = workflowsData.data?.find((w: any) => 
        w.name.toLowerCase().includes(workflowName.toLowerCase())
      );

      if (!workflow) {
        console.log(`Workflow "${workflowName}" not found`);
        continue;
      }

      console.log(`Found workflow: ${workflow.name} (ID: ${workflow.id})`);

      // Get executions WITHOUT startedAfter filter (causes issues with n8n API)
      const executionsUrl = `https://tikt.app.n8n.cloud/api/v1/executions?workflowId=${workflow.id}&status=success&limit=100`;
      console.log(`Fetching executions from: ${executionsUrl}`);
      
      const executionsResponse = await fetch(executionsUrl, {
        method: 'GET',
        headers: {
          'X-N8N-API-KEY': n8nApiKey,
          'Content-Type': 'application/json',
        },
      });

      if (!executionsResponse.ok) {
        const errorText = await executionsResponse.text();
        console.error(`Failed to fetch executions for workflow ${workflow.name}:`, errorText);
        continue;
      }

      const executionsData = await executionsResponse.json();
      const executions = executionsData.data || [];
      console.log(`Found ${executions.length} successful executions for ${workflow.name}`);

      // Filter executions from past 30 days (client-side filtering)
      const recentExecutions = executions.filter((exec: any) => {
        const execDate = new Date(exec.startedAt || exec.createdAt);
        return execDate >= thirtyDaysAgo;
      });
      
      console.log(`${recentExecutions.length} executions from past 30 days for ${workflow.name}`);

      // Get time saved per execution for this workflow (default to 5 if not found)
      const minutesPerExecution = timeSavedMap[workflowName.toLowerCase()] || 5;
      const workflowMinutesSaved = recentExecutions.length * minutesPerExecution;
      
      console.log(`${workflow.name}: ${recentExecutions.length} executions × ${minutesPerExecution} min = ${workflowMinutesSaved} minutes`);

      breakdownByWorkflow[workflow.name] = {
        executions: recentExecutions.length,
        minutesSaved: workflowMinutesSaved,
        minutesPerExecution,
      };

      totalExecutions += recentExecutions.length;
      totalSavedMinutes += workflowMinutesSaved;
    }

    const totalHours = Math.round((totalSavedMinutes / 60) * 10) / 10;
    
    console.log(`Total: ${totalExecutions} executions = ${totalSavedMinutes} minutes = ${totalHours} hours`);
    console.log('Breakdown:', JSON.stringify(breakdownByWorkflow));

    return new Response(
      JSON.stringify({
        totalHours,
        totalMinutes: totalSavedMinutes,
        executionCount: totalExecutions,
        breakdown: breakdownByWorkflow,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-saved-hours:', error);
    return new Response(
      JSON.stringify({ error: error.message, totalHours: 0 }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});