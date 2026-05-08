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

interface WorkflowInfo {
  timeSaved: number;
  companyName: string;
  workflowType: string;
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

    // Build workflow info map: workflow name -> { timeSaved, companyName, workflowType }
    const workflowInfoMap: Record<string, WorkflowInfo> = {};
    
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
        if (setting.automation_name === 'zoekwoord-onderzoek' && setting.time_saved_per_execution) {
          zoekwoordTimeSaved = setting.time_saved_per_execution;
        }
        if ((setting.automation_name === 'blogs' || setting.automation_name === 'seo-blog') && setting.time_saved_per_execution) {
          blogsTimeSaved = setting.time_saved_per_execution;
        }
        
        // Add base workflows with their time_saved - these are "Overig" company
        if (setting.n8n_workflow_name && setting.time_saved_per_execution !== null && setting.time_saved_per_execution > 0) {
          const nameLower = setting.n8n_workflow_name.toLowerCase();
          workflowInfoMap[nameLower] = {
            timeSaved: setting.time_saved_per_execution,
            companyName: 'Overig',
            workflowType: setting.automation_name || setting.n8n_workflow_name,
          };
        }
      }
    }

    // Fetch companies with their workflow names
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('name, seo_research_n8n_name, subkeywords_n8n_name, blogs_n8n_name');

    if (companiesError) {
      console.error('Error fetching companies:', companiesError);
    }

    if (companies) {
      for (const company of companies) {
        // SEO Research workflows
        if (company.seo_research_n8n_name) {
          const nameLower = company.seo_research_n8n_name.toLowerCase();
          workflowInfoMap[nameLower] = {
            timeSaved: zoekwoordTimeSaved,
            companyName: company.name,
            workflowType: 'SEO Zoekwoorden',
          };
        }
        // Subkeywords workflows
        if (company.subkeywords_n8n_name) {
          const nameLower = company.subkeywords_n8n_name.toLowerCase();
          workflowInfoMap[nameLower] = {
            timeSaved: zoekwoordTimeSaved,
            companyName: company.name,
            workflowType: 'Subkeywords',
          };
        }
        // Blogs workflows
        if (company.blogs_n8n_name) {
          const nameLower = company.blogs_n8n_name.toLowerCase();
          workflowInfoMap[nameLower] = {
            timeSaved: blogsTimeSaved,
            companyName: company.name,
            workflowType: 'SEO Blog',
          };
        }
      }
    }

    console.log('Workflow info map:', JSON.stringify(workflowInfoMap));

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

    // Create a map of workflow IDs to names and info
    const workflowIdToName = new Map<string, string>();
    const workflowIdToInfo = new Map<string, WorkflowInfo>();
    
    workflows.forEach((w: any) => {
      workflowIdToName.set(w.id, w.name);
      const workflowNameLower = w.name.toLowerCase();
      
      // Find matching workflow info
      for (const [key, info] of Object.entries(workflowInfoMap)) {
        if (workflowNameLower.includes(key) || key.includes(workflowNameLower)) {
          workflowIdToInfo.set(w.id, info);
          break;
        }
      }
    });

    // Find workflow IDs that have configured info
    const targetWorkflowIds: string[] = Array.from(workflowIdToInfo.keys());

    console.log(`Found ${targetWorkflowIds.length} matching workflows`);

    if (targetWorkflowIds.length === 0) {
      console.log('No configured workflows found');
      return new Response(
        JSON.stringify({ 
          totalHours: 0, 
          totalMinutes: 0, 
          executionCount: 0, 
          breakdown: {},
          breakdownByCompany: {},
          periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          periodEnd: new Date().toISOString(),
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate date range for past 30 days
    const periodEnd = new Date();
    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() - 30);
    console.log(`Fetching executions from the last 30 days (since ${periodStart.toISOString()})`);

    // Fetch ALL executions using cursor-based pagination
    let allExecutions: N8nExecution[] = [];
    let cursor: string | undefined = undefined;
    let hasMore = true;
    let pageCount = 0;
    const maxPages = 50;

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
        new Date(e.startedAt) >= periodStart
      );

      allExecutions.push(...recentExecutions);

      // Check if the oldest execution in this page is older than 30 days
      const oldestInPage = pageExecutions[pageExecutions.length - 1];
      if (new Date(oldestInPage.startedAt) < periodStart) {
        console.log('Reached executions older than 30 days, stopping pagination');
        hasMore = false;
        break;
      }

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

    // Calculate time saved per workflow and per company
    let totalSavedMinutes = 0;
    let totalExecutions = 0;
    const breakdownByWorkflow: Record<string, { executions: number; minutesSaved: number; minutesPerExecution: number }> = {};
    const breakdownByCompany: Record<string, { 
      totalMinutes: number; 
      totalHours: number; 
      workflows: Record<string, { executions: number; minutesSaved: number }> 
    }> = {};

    for (const exec of filteredExecutions) {
      const workflowName = workflowIdToName.get(exec.workflowId) || `Workflow ${exec.workflowId}`;
      const info = workflowIdToInfo.get(exec.workflowId);

      if (!info) {
        continue;
      }

      const minutesPerExecution = info.timeSaved;
      const companyName = info.companyName;
      const workflowType = info.workflowType;

      // Update workflow breakdown
      if (!breakdownByWorkflow[workflowName]) {
        breakdownByWorkflow[workflowName] = {
          executions: 0,
          minutesSaved: 0,
          minutesPerExecution,
        };
      }
      breakdownByWorkflow[workflowName].executions++;
      breakdownByWorkflow[workflowName].minutesSaved += minutesPerExecution;

      // Update company breakdown
      if (!breakdownByCompany[companyName]) {
        breakdownByCompany[companyName] = {
          totalMinutes: 0,
          totalHours: 0,
          workflows: {},
        };
      }
      if (!breakdownByCompany[companyName].workflows[workflowType]) {
        breakdownByCompany[companyName].workflows[workflowType] = {
          executions: 0,
          minutesSaved: 0,
        };
      }
      breakdownByCompany[companyName].workflows[workflowType].executions++;
      breakdownByCompany[companyName].workflows[workflowType].minutesSaved += minutesPerExecution;
      breakdownByCompany[companyName].totalMinutes += minutesPerExecution;

      totalExecutions++;
      totalSavedMinutes += minutesPerExecution;
    }

    // Calculate total hours per company
    for (const company of Object.keys(breakdownByCompany)) {
      breakdownByCompany[company].totalHours = Math.round((breakdownByCompany[company].totalMinutes / 60) * 10) / 10;
    }

    const totalHours = Math.round((totalSavedMinutes / 60) * 10) / 10;

    console.log(`Total: ${totalExecutions} executions = ${totalSavedMinutes} minutes = ${totalHours} hours`);
    console.log('Breakdown by company:', JSON.stringify(breakdownByCompany));

    return new Response(
      JSON.stringify({
        totalHours,
        totalMinutes: totalSavedMinutes,
        executionCount: totalExecutions,
        periodStart: periodStart.toISOString(),
        periodEnd: periodEnd.toISOString(),
        breakdown: breakdownByWorkflow,
        breakdownByCompany,
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
