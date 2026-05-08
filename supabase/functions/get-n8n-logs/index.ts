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
  time_saved_minutes: number | null;
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

  // Require authenticated caller
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  {
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const sUrl = Deno.env.get('SUPABASE_URL')!;
    const sKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const authClient = createClient(sUrl, sKey, { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error: userErr } = await authClient.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  try {
    const n8nApiKey = Deno.env.get('N8N_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!n8nApiKey) {
      console.error('N8N_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'N8N API key not configured', logs: [] }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { limit = 100, automationFilter, statusFilter } = await req.json().catch(() => ({}));
    
    console.log(`Fetching ALL n8n logs, limit: ${limit}, automationFilter: ${automationFilter}, statusFilter: ${statusFilter}`);
    
    // Fetch time_saved_per_execution and n8n_workflow_name from automation_settings
    let timeSavedMap: Record<string, number> = {};
    let configuredWorkflowNames: string[] = [];
    
    if (supabaseUrl && supabaseServiceKey) {
      try {
        // Fetch automation_settings for base workflow names and time saved
        const settingsResponse = await fetch(`${supabaseUrl}/rest/v1/automation_settings?select=automation_name,n8n_workflow_name,time_saved_per_execution`, {
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
        });
        
        let zoekwoordTimeSaved = 30; // default
        let blogsTimeSaved = 30; // default
        
        if (settingsResponse.ok) {
          const settings = await settingsResponse.json();
          settings.forEach((s: any) => {
            if (s.n8n_workflow_name) {
              const nameLower = s.n8n_workflow_name.toLowerCase();
              configuredWorkflowNames.push(nameLower);
              if (s.time_saved_per_execution) {
                timeSavedMap[nameLower] = s.time_saved_per_execution;
              }
            }
            // Store time_saved for mapping to company workflows
            if (s.automation_name === 'zoekwoord-onderzoek' && s.time_saved_per_execution) {
              zoekwoordTimeSaved = s.time_saved_per_execution;
            }
            if (s.automation_name === 'blogs' && s.time_saved_per_execution) {
              blogsTimeSaved = s.time_saved_per_execution;
            }
          });
          console.log('Configured workflow names from settings:', configuredWorkflowNames);
        }
        
        // Fetch company-specific workflow names
        const companiesResponse = await fetch(`${supabaseUrl}/rest/v1/companies?select=seo_research_n8n_name,subkeywords_n8n_name,blogs_n8n_name`, {
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
        });
        
        if (companiesResponse.ok) {
          const companies = await companiesResponse.json();
          companies.forEach((c: any) => {
            // SEO Research workflows (e.g., "TIKT zoekwoorden", "MEDIABIRDS zoekwoorden")
            if (c.seo_research_n8n_name) {
              const nameLower = c.seo_research_n8n_name.toLowerCase();
              configuredWorkflowNames.push(nameLower);
              timeSavedMap[nameLower] = zoekwoordTimeSaved;
            }
            // Subkeywords workflows
            if (c.subkeywords_n8n_name) {
              const nameLower = c.subkeywords_n8n_name.toLowerCase();
              configuredWorkflowNames.push(nameLower);
              timeSavedMap[nameLower] = zoekwoordTimeSaved;
            }
            // Blogs workflows (e.g., "TIKT seo", "MEDIABIRDS seo")
            if (c.blogs_n8n_name) {
              const nameLower = c.blogs_n8n_name.toLowerCase();
              configuredWorkflowNames.push(nameLower);
              timeSavedMap[nameLower] = blogsTimeSaved;
            }
          });
          console.log('Added company workflow names:', companies.length, 'companies');
        }
        
        console.log('All configured workflow names:', configuredWorkflowNames);
        console.log('Time saved map:', timeSavedMap);
      } catch (e) {
        console.error('Error fetching settings/companies:', e);
      }
    }

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

    // Determine which workflow IDs to show
    let targetWorkflowIds: string[] = [];
    
    if (automationFilter) {
      // Specific filter: find exact workflow match
      const matchingWorkflow = workflows.find((w: any) => w.name === automationFilter);
      if (matchingWorkflow) {
        targetWorkflowIds = [matchingWorkflow.id];
        console.log(`Filtering to workflow: ${automationFilter} (ID: ${matchingWorkflow.id})`);
      } else {
        console.log(`No exact match for automationFilter: ${automationFilter}`);
        return new Response(
          JSON.stringify({ logs: [] }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      // No filter: only show workflows that are configured in automation_settings
      targetWorkflowIds = workflows
        .filter((w: any) => {
          const workflowNameLower = w.name.toLowerCase();
          return configuredWorkflowNames.some(configName => 
            workflowNameLower.includes(configName) || configName.includes(workflowNameLower)
          );
        })
        .map((w: any) => w.id);
      
      console.log(`Configured workflows found: ${targetWorkflowIds.length} matching ${configuredWorkflowNames.length} configured names`);
    }

    // Fetch ALL executions from the last 30 days using cursor-based pagination
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);
    
    console.log(`Fetching all executions from the last 30 days (since ${cutoffDate.toISOString()})`);
    
    let allExecutions: N8nExecution[] = [];
    let cursor: string | undefined = undefined;
    let hasMore = true;
    let pageCount = 0;
    const maxPages = 50; // Safety limit to prevent infinite loops
    
    while (hasMore && pageCount < maxPages) {
      pageCount++;
      let executionsUrl = `https://tikt.app.n8n.cloud/api/v1/executions?limit=250`;
      if (cursor) {
        executionsUrl += `&cursor=${cursor}`;
      }
      
      console.log(`Fetching page ${pageCount}: ${executionsUrl}`);
      
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
        break;
      }

      const executionsData = await executionsResponse.json();
      const pageExecutions: N8nExecution[] = executionsData.data || [];
      
      if (pageExecutions.length === 0) {
        hasMore = false;
        break;
      }
      
      // Filter executions within the 30-day window
      const recentExecutions = pageExecutions.filter(e => 
        new Date(e.startedAt) >= cutoffDate
      );
      
      allExecutions.push(...recentExecutions);
      
      // Check if the oldest execution in this page is older than 30 days
      const oldestInPage = pageExecutions[pageExecutions.length - 1];
      if (new Date(oldestInPage.startedAt) < cutoffDate) {
        console.log(`Reached executions older than 30 days, stopping pagination`);
        hasMore = false;
        break;
      }
      
      // Get next cursor
      cursor = executionsData.nextCursor;
      if (!cursor) {
        hasMore = false;
      }
    }
    
    console.log(`Fetched ${allExecutions.length} executions from ${pageCount} pages`);
    
    let executions: N8nExecution[] = allExecutions;

    console.log(`Found ${executions.length} executions`);

    // Filter by workflow IDs (always applied now - either specific filter or configured workflows)
    if (targetWorkflowIds.length > 0) {
      executions = executions.filter(e => targetWorkflowIds.includes(e.workflowId));
      console.log(`Filtered to ${executions.length} executions for target workflows`);
    } else if (!automationFilter) {
      // No configured workflows found, return empty
      console.log('No configured workflows found in automation_settings');
      return new Response(
        JSON.stringify({ logs: [] }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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

      // Calculate time saved for successful executions
      let timeSavedMinutes: number | null = null;
      if (exec.status === 'success') {
        const workflowNameLower = workflowName.toLowerCase();
        // Check for exact match or partial match
        for (const [key, value] of Object.entries(timeSavedMap)) {
          if (workflowNameLower.includes(key) || key.includes(workflowNameLower)) {
            timeSavedMinutes = value;
            break;
          }
        }
      }

      return {
        id: exec.id,
        automation_name: workflowName,
        status: status,
        message: message,
        execution_time_ms: executionTime,
        time_saved_minutes: timeSavedMinutes,
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

    console.log(`Returning ${logs.length} log entries from the last 30 days`);

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
