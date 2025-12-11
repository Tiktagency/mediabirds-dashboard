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

    // Calculate date range for past month
    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const startedAfter = oneMonthAgo.toISOString();

    let totalSavedMinutes = 0;

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

      // Get all successful executions for this workflow in the past month
      const executionsResponse = await fetch(
        `https://tikt.app.n8n.cloud/api/v1/executions?workflowId=${workflow.id}&status=success&startedAfter=${startedAfter}&limit=100`,
        {
          method: 'GET',
          headers: {
            'X-N8N-API-KEY': n8nApiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!executionsResponse.ok) {
        console.error(`Failed to fetch executions for workflow ${workflow.name}`);
        continue;
      }

      const executionsData = await executionsResponse.json();
      const executions = executionsData.data || [];
      console.log(`Found ${executions.length} successful executions for ${workflow.name}`);

      // Sum up saved_minutes from execution data
      for (const execution of executions) {
        // Check if execution has saved_minutes in its data
        // This could be in different places depending on workflow structure
        const savedMinutes = extractSavedMinutes(execution);
        if (savedMinutes > 0) {
          totalSavedMinutes += savedMinutes;
          console.log(`Execution ${execution.id}: ${savedMinutes} saved minutes`);
        }
      }
    }

    const totalHours = Math.round((totalSavedMinutes / 60) * 10) / 10; // Round to 1 decimal
    console.log(`Total saved: ${totalSavedMinutes} minutes = ${totalHours} hours`);

    return new Response(
      JSON.stringify({
        totalHours,
        totalMinutes: totalSavedMinutes,
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

// Helper function to extract saved_minutes from execution data
function extractSavedMinutes(execution: any): number {
  try {
    // Check various possible locations for saved_minutes
    // In the execution result data
    if (execution.data?.resultData?.runData) {
      const runData = execution.data.resultData.runData;
      for (const nodeName of Object.keys(runData)) {
        const nodeRuns = runData[nodeName];
        if (Array.isArray(nodeRuns)) {
          for (const run of nodeRuns) {
            if (run.data?.main) {
              for (const mainData of run.data.main) {
                if (Array.isArray(mainData)) {
                  for (const item of mainData) {
                    if (item.json?.saved_minutes) {
                      return Number(item.json.saved_minutes) || 0;
                    }
                    if (item.json?.savedMinutes) {
                      return Number(item.json.savedMinutes) || 0;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    
    // Direct property check
    if (execution.saved_minutes) {
      return Number(execution.saved_minutes) || 0;
    }
    if (execution.savedMinutes) {
      return Number(execution.savedMinutes) || 0;
    }

    return 0;
  } catch (e) {
    console.error('Error extracting saved_minutes:', e);
    return 0;
  }
}
