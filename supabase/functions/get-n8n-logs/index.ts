import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface N8nExecution {
  id: string;
  workflowId: string;
  finished: boolean;
  mode: string;
  startedAt: string;
  stoppedAt: string | null;
  status: 'success' | 'error' | 'running' | 'waiting';
  data?: {
    resultData?: {
      error?: {
        message: string;
      };
    };
  };
}

interface LogEntry {
  id: string;
  automation_name: string;
  status: string;
  message: string;
  execution_time_ms: number | null;
  created_at: string;
  metadata: {
    workflowId: string;
    executionId: string;
    mode: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const n8nApiKey = Deno.env.get('N8N_API_KEY');
    if (!n8nApiKey) {
      console.error('N8N_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'N8N API key not configured', logs: [] }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { limit = 100, workflowNames, automationFilter, statusFilter } = await req.json().catch(() => ({}));
    
    console.log(`Fetching n8n logs, limit: ${limit}, automationFilter: ${automationFilter}, statusFilter: ${statusFilter}`);

    // Fetch all workflows
    const workflowsResponse = await fetch('https://tikt.app.n8n.cloud/api/v1/workflows', {
      method: 'GET',
      headers: {
        'X-N8N-API-KEY': n8nApiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!workflowsResponse.ok) {
      console.error('Failed to fetch workflows');
      return new Response(
        JSON.stringify({ error: 'Failed to fetch workflows', logs: [] }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const workflowsData = await workflowsResponse.json();
    const workflows = workflowsData.data || [];
    
    console.log(`Found ${workflows.length} workflows`);

    // Create a map of workflow IDs to names
    const workflowMap = new Map<string, string>();
    workflows.forEach((w: any) => {
      workflowMap.set(w.id, w.name);
    });

    // Filter workflows if specific names are requested
    let targetWorkflowIds: string[] = [];
    if (workflowNames && workflowNames.length > 0) {
      workflows.forEach((w: any) => {
        if (workflowNames.some((name: string) => 
          w.name.toLowerCase().includes(name.toLowerCase())
        )) {
          targetWorkflowIds.push(w.id);
        }
      });
    }

    // If automationFilter is specified, find the matching workflow ID
    if (automationFilter) {
      const matchingWorkflow = workflows.find((w: any) => w.name === automationFilter);
      if (matchingWorkflow) {
        // Override targetWorkflowIds with just this one workflow
        targetWorkflowIds = [matchingWorkflow.id];
        console.log(`Filtering to workflow: ${automationFilter} (ID: ${matchingWorkflow.id})`);
      } else {
        console.log(`No exact match for automationFilter: ${automationFilter}`);
        // If no exact match, return empty logs
        return new Response(
          JSON.stringify({ logs: [] }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Fetch all recent executions (n8n API has a max limit of 250)
    const apiLimit = Math.min(limit, 250);
    let executionsUrl = `https://tikt.app.n8n.cloud/api/v1/executions?limit=${apiLimit}`;
    
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
      console.error(`Failed to fetch executions: ${executionsResponse.status} - ${errorText}`);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch executions', logs: [] }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const executionsData = await executionsResponse.json();
    let executions: N8nExecution[] = executionsData.data || [];

    console.log(`Found ${executions.length} executions`);

    // Filter by workflow IDs if specified
    if (targetWorkflowIds.length > 0) {
      executions = executions.filter(e => targetWorkflowIds.includes(e.workflowId));
      console.log(`Filtered to ${executions.length} executions for target workflows`);
    }

    // Transform executions to log entries
    let logs: LogEntry[] = executions.map(exec => {
      const workflowName = workflowMap.get(exec.workflowId) || `Workflow ${exec.workflowId}`;
      const startTime = new Date(exec.startedAt).getTime();
      const endTime = exec.stoppedAt ? new Date(exec.stoppedAt).getTime() : null;
      const executionTime = endTime ? endTime - startTime : null;

      let message = '';
      let status = exec.status;

      if (exec.status === 'success') {
        message = `Workflow "${workflowName}" succesvol uitgevoerd`;
        status = 'success';
      } else if (exec.status === 'error') {
        message = exec.data?.resultData?.error?.message || `Workflow "${workflowName}" mislukt`;
        status = 'error';
      } else if (exec.status === 'running') {
        message = `Workflow "${workflowName}" is bezig...`;
        status = 'info';
      } else {
        message = `Workflow "${workflowName}" status: ${exec.status}`;
        status = 'info';
      }

      return {
        id: exec.id,
        automation_name: workflowName,
        status: status,
        message: message,
        execution_time_ms: executionTime,
        created_at: exec.stoppedAt || exec.startedAt,
        metadata: {
          workflowId: exec.workflowId,
          executionId: exec.id,
          mode: exec.mode,
        },
      };
    });

    // Apply status filter server-side
    if (statusFilter) {
      logs = logs.filter(log => log.status === statusFilter);
      console.log(`Filtered to ${logs.length} logs with status: ${statusFilter}`);
    }

    // Sort by created_at descending
    logs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    console.log(`Returning ${logs.length} log entries`);

    return new Response(
      JSON.stringify({ logs }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-n8n-logs:', error);
    return new Response(
      JSON.stringify({ error: error.message, logs: [] }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
