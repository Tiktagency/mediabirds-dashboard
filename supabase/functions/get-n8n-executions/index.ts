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

  // Require authenticated caller
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error: userErr } = await authClient.auth.getUser();
  if (userErr || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
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

    const body = await req.json();
    // Support both single workflowName and array workflowNames
    const workflowNames: string[] = body.workflowNames || (body.workflowName ? [body.workflowName] : []);
    
    if (!workflowNames.length) {
      return new Response(
        JSON.stringify({ error: 'workflowName or workflowNames is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching executions for workflows: ${workflowNames.join(', ')}`);

    // Fetch all workflows once
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
        JSON.stringify({ error: 'n8n temporarily unavailable', results: workflowNames.map(name => ({ workflowName: name, lastRun: null })) }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const workflowsData = await workflowsResponse.json();
    console.log(`Found ${workflowsData.data?.length || 0} workflows`);

    // For each requested workflow name, find and fetch executions in parallel
    const results = await Promise.all(workflowNames.map(async (workflowName) => {
      const workflow = workflowsData.data?.find((w: any) =>
        w.name.toLowerCase().includes(workflowName.toLowerCase())
      );

      if (!workflow) {
        console.log(`Workflow "${workflowName}" not found`);
        return { workflowName, lastRun: null };
      }

      try {
        const executionsResponse = await fetch(
          `https://tikt.app.n8n.cloud/api/v1/executions?workflowId=${workflow.id}&status=success&limit=1`,
          {
            method: 'GET',
            headers: { 'X-N8N-API-KEY': n8nApiKey, 'Content-Type': 'application/json' },
          }
        );

        if (!executionsResponse.ok) {
          return { workflowName, lastRun: null };
        }

        const executionsData = await executionsResponse.json();
        const lastExecution = executionsData.data?.[0];
        return {
          workflowName,
          lastRun: lastExecution?.stoppedAt || lastExecution?.startedAt || null,
        };
      } catch {
        return { workflowName, lastRun: null };
      }
    }));

    // Legacy single-workflow support: if only one was requested, also return flat fields
    const single = results[0];
    return new Response(
      JSON.stringify({
        results,
        // Legacy fields for backwards compat
        workflowName: single?.workflowName,
        lastRun: single?.lastRun ?? null,
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
