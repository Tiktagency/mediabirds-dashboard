import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
        JSON.stringify({ error: 'N8N API key not configured', totalHours: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Build time saved map from automation_settings and companies
    const timeSavedMap: Record<string, number> = {};
    const configuredWorkflowNames: string[] = [];
    
    // Fetch automation_settings for base workflow names and time saved
    const { data: automationSettings, error: settingsError } = await supabase
      .from('automation_settings')
      .select('automation_name, n8n_workflow_name, time_saved_per_execution');

    if (settingsError) {
      console.error('Error fetching automation settings:', settingsError);
    }

    let zoekwoordTimeSaved = 30; // default
    let blogsTimeSaved = 30; // default

    if (automationSettings) {
      for (const setting of automationSettings) {
        // Store time_saved for mapping to company workflows
        if (setting.automation_name === 'zoekwoord-onderzoek' && setting.time_saved_per_execution) {
          zoekwoordTimeSaved = setting.time_saved_per_execution;
        }
        if ((setting.automation_name === 'blogs' || setting.automation_name === 'seo-blog') && setting.time_saved_per_execution) {
          blogsTimeSaved = setting.time_saved_per_execution;
        }
        
        // Add base workflows with their time_saved
        if (setting.n8n_workflow_name && setting.time_saved_per_execution !== null && setting.time_saved_per_execution > 0) {
          const nameLower = setting.n8n_workflow_name.toLowerCase();
          configuredWorkflowNames.push(nameLower);
          timeSavedMap[nameLower] = setting.time_saved_per_execution;
        }
      }
    }
    
    console.log('Base workflow names from settings:', configuredWorkflowNames);

    // Fetch company-specific workflow names
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('seo_research_n8n_name, subkeywords_n8n_name, blogs_n8n_name');

    if (companiesError) {
      console.error('Error fetching companies:', companiesError);
    }

    if (companies) {
      for (const company of companies) {
        // SEO Research workflows
        if (company.seo_research_n8n_name) {
          const nameLower = company.seo_research_n8n_name.toLowerCase();
          configuredWorkflowNames.push(nameLower);
          timeSavedMap[nameLower] = zoekwoordTimeSaved;
        }
        // Subkeywords workflows
        if (company.subkeywords_n8n_name) {
          const nameLower = company.subkeywords_n8n_name.toLowerCase();
          configuredWorkflowNames.push(nameLower);
          timeSavedMap[nameLower] = zoekwoordTimeSaved;
        }
        // Blogs workflows
        if (company.blogs_n8n_name) {
          const nameLower = company.blogs_n8n_name.toLowerCase();
          configuredWorkflowNames.push(nameLower);
          timeSavedMap[nameLower] = blogsTimeSaved;
        }
      }
      console.log(`Added workflow names from ${companies.length} companies`);
    }

    console.log('All configured workflow names:', configuredWorkflowNames);
    console.log('Time saved map:', JSON.stringify(timeSavedMap));

    // Fetch all workflows from n8n
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
    const workflows = workflowsData.data || [];
    console.log(`Found ${workflows.length} workflows in n8n`);

    // Create a map of workflow IDs to names
    const workflowIdToName = new Map<string, string>();
    workflows.forEach((w: any) => {
      workflowIdToName.set(w.id, w.name);
    });

    // Find workflow IDs that match our configured workflows
    const targetWorkflowIds: string[] = workflows
      .filter((w: any) => {
        const workflowNameLower = w.name.toLowerCase();
        return configuredWorkflowNames.some(configName => 
          workflowNameLower.includes(configName) || configName.includes(workflowNameLower)
        );
      })
      .map((w: any) => w.id);

    console.log(`Found ${targetWorkflowIds.length} matching workflows`);

    if (targetWorkflowIds.length === 0) {
      console.log('No configured workflows found');
      return new Response(
        JSON.stringify({ totalHours: 0, totalMinutes: 0, executionCount: 0, breakdown: {} }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate date range for past 30 days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);
    console.log(`Fetching executions from the last 30 days (since ${cutoffDate.toISOString()})`);

    // Fetch ALL executions using cursor-based pagination (same as get-n8n-logs)
    let allExecutions: N8nExecution[] = [];
    let cursor: string | undefined = undefined;
    let hasMore = true;
    let pageCount = 0;
    const maxPages = 50; // Safety limit

    while (hasMore && pageCount < maxPages) {
      pageCount++;
      let executionsUrl = `https://tikt.app.n8n.cloud/api/v1/executions?limit=250&status=success`;
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
        console.log('Reached executions older than 30 days, stopping pagination');
        hasMore = false;
        break;
      }

      // Get next cursor
      cursor = executionsData.nextCursor;
      if (!cursor) {
        hasMore = false;
      }
    }

    console.log(`Fetched ${allExecutions.length} successful executions from ${pageCount} pages`);

    // Filter to only target workflows
    const filteredExecutions = allExecutions.filter(e => 
      targetWorkflowIds.includes(e.workflowId)
    );
    console.log(`Filtered to ${filteredExecutions.length} executions for configured workflows`);

    // Calculate time saved per workflow
    let totalSavedMinutes = 0;
    let totalExecutions = 0;
    const breakdownByWorkflow: Record<string, { executions: number; minutesSaved: number; minutesPerExecution: number }> = {};

    for (const exec of filteredExecutions) {
      const workflowName = workflowIdToName.get(exec.workflowId) || `Workflow ${exec.workflowId}`;
      const workflowNameLower = workflowName.toLowerCase();

      // Find matching time_saved value
      let minutesPerExecution: number | null = null;
      for (const [key, value] of Object.entries(timeSavedMap)) {
        if (workflowNameLower.includes(key) || key.includes(workflowNameLower)) {
          minutesPerExecution = value;
          break;
        }
      }

      if (minutesPerExecution === null) {
        continue; // Skip workflows without configured time_saved
      }

      if (!breakdownByWorkflow[workflowName]) {
        breakdownByWorkflow[workflowName] = {
          executions: 0,
          minutesSaved: 0,
          minutesPerExecution,
        };
      }

      breakdownByWorkflow[workflowName].executions++;
      breakdownByWorkflow[workflowName].minutesSaved += minutesPerExecution;
      totalExecutions++;
      totalSavedMinutes += minutesPerExecution;
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
