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

// Helper function to extract company name from workflow name
function extractCompanyFromWorkflowName(workflowName: string, companyNames: string[]): string | null {
  const nameLower = workflowName.toLowerCase();
  for (const companyName of companyNames) {
    if (nameLower.startsWith(companyName.toLowerCase())) {
      return companyName;
    }
  }
  return null;
}

// Helper function to determine workflow type from name
function determineWorkflowType(workflowName: string): string {
  const nameLower = workflowName.toLowerCase();
  if (nameLower.includes('alt-text') || nameLower.includes('alttext')) return 'Alt-text';
  if (nameLower.includes('monday') || nameLower.includes('planning')) return 'Monday Planning';
  if (nameLower.includes('blog')) return 'SEO Blog';
  if (nameLower.includes('zoekwoord') || nameLower.includes('seo')) return 'SEO Zoekwoorden';
  if (nameLower.includes('subkeyword')) return 'Subkeywords';
  return 'Overig';
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

    // Fetch automation_settings for time saved values
    const { data: automationSettings, error: settingsError } = await supabase
      .from('automation_settings')
      .select('automation_name, n8n_workflow_name, time_saved_per_execution');

    if (settingsError) {
      console.error('Error fetching automation settings:', settingsError);
    }

    // Build time saved lookup from automation_settings
    const timeSavedMap: Record<string, number> = {};
    let defaultZoekwoordTimeSaved = 30;
    let defaultBlogsTimeSaved = 30;
    let defaultAltTextTimeSaved = 3;
    let defaultMondayTimeSaved = 45;

    if (automationSettings) {
      for (const setting of automationSettings) {
        if (setting.n8n_workflow_name && setting.time_saved_per_execution) {
          timeSavedMap[setting.n8n_workflow_name.toLowerCase()] = setting.time_saved_per_execution;
        }
        // Store default times for workflow types
        if (setting.automation_name === 'zoekwoord-onderzoek' && setting.time_saved_per_execution) {
          defaultZoekwoordTimeSaved = setting.time_saved_per_execution;
        }
        if ((setting.automation_name === 'blogs' || setting.automation_name === 'seo-blog') && setting.time_saved_per_execution) {
          defaultBlogsTimeSaved = setting.time_saved_per_execution;
        }
        if (setting.automation_name === 'alt-text' && setting.time_saved_per_execution) {
          defaultAltTextTimeSaved = setting.time_saved_per_execution;
        }
        if (setting.automation_name === 'monday-planning' && setting.time_saved_per_execution) {
          defaultMondayTimeSaved = setting.time_saved_per_execution;
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

    // Build exact match map from companies table (highest priority)
    const exactMatchMap: Record<string, WorkflowInfo> = {};
    const companyNames: string[] = [];

    if (companies) {
      for (const company of companies) {
        companyNames.push(company.name);
        
        if (company.seo_research_n8n_name) {
          exactMatchMap[company.seo_research_n8n_name.toLowerCase()] = {
            timeSaved: defaultZoekwoordTimeSaved,
            companyName: company.name,
            workflowType: 'SEO Zoekwoorden',
          };
        }
        if (company.subkeywords_n8n_name) {
          exactMatchMap[company.subkeywords_n8n_name.toLowerCase()] = {
            timeSaved: defaultZoekwoordTimeSaved,
            companyName: company.name,
            workflowType: 'Subkeywords',
          };
        }
        if (company.blogs_n8n_name) {
          exactMatchMap[company.blogs_n8n_name.toLowerCase()] = {
            timeSaved: defaultBlogsTimeSaved,
            companyName: company.name,
            workflowType: 'SEO Blog',
          };
        }
      }
    }

    console.log('Company names:', companyNames);
    console.log('Exact match map:', JSON.stringify(exactMatchMap));

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

    // Create a map of workflow IDs to names and info using priority-based matching
    const workflowIdToName = new Map<string, string>();
    const workflowIdToInfo = new Map<string, WorkflowInfo>();
    
    workflows.forEach((w: any) => {
      workflowIdToName.set(w.id, w.name);
      const workflowNameLower = w.name.toLowerCase();
      
      // Priority 1: Exact match in companies table
      if (exactMatchMap[workflowNameLower]) {
        workflowIdToInfo.set(w.id, exactMatchMap[workflowNameLower]);
        console.log(`Matched "${w.name}" via exact match -> ${exactMatchMap[workflowNameLower].companyName}`);
        return;
      }
      
      // Priority 2: Company prefix match (e.g., "MEDIABIRDS Alt-text" -> Mediabirds)
      const companyFromPrefix = extractCompanyFromWorkflowName(w.name, companyNames);
      if (companyFromPrefix) {
        const workflowType = determineWorkflowType(w.name);
        let timeSaved = timeSavedMap[workflowNameLower];
        
        // If no exact time saved, use default based on workflow type
        if (!timeSaved) {
          if (workflowType === 'Alt-text') timeSaved = defaultAltTextTimeSaved;
          else if (workflowType === 'Monday Planning') timeSaved = defaultMondayTimeSaved;
          else if (workflowType === 'SEO Blog') timeSaved = defaultBlogsTimeSaved;
          else if (workflowType === 'SEO Zoekwoorden' || workflowType === 'Subkeywords') timeSaved = defaultZoekwoordTimeSaved;
          else timeSaved = 10; // fallback default
        }
        
        workflowIdToInfo.set(w.id, {
          timeSaved,
          companyName: companyFromPrefix,
          workflowType,
        });
        console.log(`Matched "${w.name}" via prefix -> ${companyFromPrefix} (${workflowType})`);
        return;
      }
      
      // Priority 3: Check automation_settings with time_saved (generic workflows -> "Overig")
      if (timeSavedMap[workflowNameLower] && timeSavedMap[workflowNameLower] > 0) {
        const workflowType = determineWorkflowType(w.name);
        workflowIdToInfo.set(w.id, {
          timeSaved: timeSavedMap[workflowNameLower],
          companyName: 'Overig',
          workflowType,
        });
        console.log(`Matched "${w.name}" via automation_settings -> Overig (${workflowType})`);
        return;
      }
      
      // Priority 4: Contains match for automation_settings entries
      for (const [key, timeSaved] of Object.entries(timeSavedMap)) {
        if (timeSaved > 0 && (workflowNameLower.includes(key) || key.includes(workflowNameLower))) {
          const workflowType = determineWorkflowType(w.name);
          workflowIdToInfo.set(w.id, {
            timeSaved,
            companyName: 'Overig',
            workflowType,
          });
          console.log(`Matched "${w.name}" via contains match -> Overig (${workflowType})`);
          return;
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
