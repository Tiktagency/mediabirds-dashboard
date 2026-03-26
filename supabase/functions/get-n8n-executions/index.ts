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
        JSON.stringify({ error: 'N8N API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { workflowName } = await req.json();
    
    if (!workflowName) {
      return new Response(
        JSON.stringify({ error: 'workflowName is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching executions for workflow: ${workflowName}`);

    // First, get all workflows to find the one matching the name
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
        JSON.stringify({ error: 'Failed to fetch workflows from n8n' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const workflowsData = await workflowsResponse.json();
    console.log(`Found ${workflowsData.data?.length || 0} workflows`);

    // Find workflow by name (case-insensitive partial match)
    const workflow = workflowsData.data?.find((w: any) => 
      w.name.toLowerCase().includes(workflowName.toLowerCase())
    );

    if (!workflow) {
      console.log(`Workflow "${workflowName}" not found`);
      return new Response(
        JSON.stringify({ error: `Workflow "${workflowName}" not found`, lastRun: null }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found workflow: ${workflow.name} (ID: ${workflow.id})`);

    // Get executions for this workflow, filtered by success status
    const executionsResponse = await fetch(
      `https://tikt.app.n8n.cloud/api/v1/executions?workflowId=${workflow.id}&status=success&limit=1`,
      {
        method: 'GET',
        headers: {
          'X-N8N-API-KEY': n8nApiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!executionsResponse.ok) {
      const errorText = await executionsResponse.text();
      console.error('Failed to fetch executions:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch executions from n8n' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const executionsData = await executionsResponse.json();
    console.log(`Found ${executionsData.data?.length || 0} successful executions`);

    const lastExecution = executionsData.data?.[0];
    
    return new Response(
      JSON.stringify({
        workflowId: workflow.id,
        workflowName: workflow.name,
        lastRun: lastExecution?.stoppedAt || lastExecution?.startedAt || null,
        executionId: lastExecution?.id || null,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-n8n-executions:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
