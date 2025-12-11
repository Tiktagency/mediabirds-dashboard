import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

    const { workflowNames } = await req.json();
    
    if (!workflowNames || !Array.isArray(workflowNames) || workflowNames.length === 0) {
      return new Response(
        JSON.stringify({ error: 'workflowNames array is required', totalHours: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching saved hours for workflows: ${workflowNames.join(', ')}`);

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

    // Calculate date range for past month (filter client-side)
    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    let totalSuccessfulExecutions = 0;

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

      // Filter executions from past month (client-side filtering)
      const recentExecutions = executions.filter((exec: any) => {
        const execDate = new Date(exec.startedAt || exec.createdAt);
        return execDate >= oneMonthAgo;
      });
      
      console.log(`${recentExecutions.length} executions from past month for ${workflow.name}`);
      totalSuccessfulExecutions += recentExecutions.length;
    }

    // Calculate saved hours: assume 5 minutes saved per successful execution
    const MINUTES_PER_EXECUTION = 5;
    const totalSavedMinutes = totalSuccessfulExecutions * MINUTES_PER_EXECUTION;
    const totalHours = Math.round((totalSavedMinutes / 60) * 10) / 10;
    
    console.log(`Total: ${totalSuccessfulExecutions} executions × ${MINUTES_PER_EXECUTION} min = ${totalSavedMinutes} minutes = ${totalHours} hours`);

    return new Response(
      JSON.stringify({
        totalHours,
        totalMinutes: totalSavedMinutes,
        executionCount: totalSuccessfulExecutions,
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
