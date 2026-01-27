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
  isShared?: boolean; // Indicates workflow should be split across companies
}

interface Company {
  name: string;
  seo_research_n8n_name: string | null;
  subkeywords_n8n_name: string | null;
  blogs_n8n_name: string | null;
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
  if (nameLower.includes('alt-text') || nameLower.includes('alttext') || nameLower.includes('alt text')) return 'Alt-text';
  if (nameLower.includes('monday') || nameLower.includes('planning')) return 'Monday Planning';
  if (nameLower.includes('simplicate')) return 'Simplicate Sync';
  if (nameLower.includes('klantenservice') || nameLower.includes('customer service')) return 'Klantenservice';
  if (nameLower.includes('database') || nameLower.includes('db sync')) return 'Database Sync';
  if (nameLower.includes('chatbot') || nameLower.includes('chat')) return 'Chatbot';
  if (nameLower.includes('blog') && !nameLower.includes('zoekwoord')) return 'SEO Blog';
  if (nameLower.includes('zoekwoord') || (nameLower.includes('seo') && !nameLower.includes('blog'))) return 'SEO Zoekwoorden';
  if (nameLower.includes('subkeyword')) return 'Subkeywords';
  return 'Overig';
}

// Check if workflow is a shared/generic SEO workflow
function isSharedSeoWorkflow(workflowName: string): 'blogs' | 'research' | null {
  const nameLower = workflowName.toLowerCase();
  // These are the generic workflow names that are shared across companies
  if (nameLower === 'seo blog' || nameLower === 'seo blogs') return 'blogs';
  if (nameLower === 'seo zoekwoorden' || nameLower === 'seo zoekwoord' || nameLower === 'seo keywords') return 'research';
  return null;
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

    const allCompanies: Company[] = companies || [];
    const companyNames: string[] = allCompanies.map(c => c.name);
    
    // Determine which companies have SEO features enabled for proportional distribution
    const companiesWithBlogs = allCompanies.filter(c => c.blogs_n8n_name);
    const companiesWithResearch = allCompanies.filter(c => c.seo_research_n8n_name);
    
    console.log('All companies:', companyNames);
    console.log('Companies with blogs:', companiesWithBlogs.map(c => c.name));
    console.log('Companies with SEO research:', companiesWithResearch.map(c => c.name));

    // Build exact match map from companies table (highest priority)
    const exactMatchMap: Record<string, WorkflowInfo> = {};

    for (const company of allCompanies) {
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
    
    // Track which workflows are shared and need proportional distribution
    const sharedWorkflows: { workflowId: string; type: 'blogs' | 'research'; timeSaved: number }[] = [];
    
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
      
      // Priority 3: Check if this is a shared SEO workflow (needs proportional distribution)
      const sharedType = isSharedSeoWorkflow(w.name);
      if (sharedType) {
        const timeSaved = sharedType === 'blogs' ? defaultBlogsTimeSaved : defaultZoekwoordTimeSaved;
        sharedWorkflows.push({ workflowId: w.id, type: sharedType, timeSaved });
        // Mark as shared for later processing
        workflowIdToInfo.set(w.id, {
          timeSaved,
          companyName: '__SHARED__',
          workflowType: sharedType === 'blogs' ? 'SEO Blog' : 'SEO Zoekwoorden',
          isShared: true,
        });
        console.log(`Identified "${w.name}" as shared ${sharedType} workflow`);
        return;
      }
      
      // Priority 4: Check automation_settings with time_saved (generic workflows -> track but don't count yet)
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
      
      // Priority 5: Contains match for automation_settings entries
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
    console.log(`Found ${sharedWorkflows.length} shared workflows for proportional distribution`);

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

    // Initialize breakdown for ALL companies (including those without executions)
    const breakdownByCompany: Record<string, { 
      totalMinutes: number; 
      totalHours: number; 
      workflows: Record<string, { executions: number; minutesSaved: number }> 
    }> = {};
    
    // Initialize all companies in breakdown (ensures Smart Charged appears even with 0 hours)
    for (const company of allCompanies) {
      breakdownByCompany[company.name] = {
        totalMinutes: 0,
        totalHours: 0,
        workflows: {},
      };
    }
    // Also add "Overig" for unmatched workflows
    breakdownByCompany['Overig'] = {
      totalMinutes: 0,
      totalHours: 0,
      workflows: {},
    };

    // Count shared workflow executions for proportional distribution
    const sharedExecutionCounts: { blogs: number; research: number } = { blogs: 0, research: 0 };
    const sharedWorkflowIds = sharedWorkflows.map(sw => sw.workflowId);
    
    for (const exec of filteredExecutions) {
      const info = workflowIdToInfo.get(exec.workflowId);
      if (info?.isShared) {
        const shared = sharedWorkflows.find(sw => sw.workflowId === exec.workflowId);
        if (shared) {
          sharedExecutionCounts[shared.type]++;
        }
      }
    }
    
    console.log(`Shared execution counts: blogs=${sharedExecutionCounts.blogs}, research=${sharedExecutionCounts.research}`);

    // Calculate time saved per workflow and per company
    let totalSavedMinutes = 0;
    let totalExecutions = 0;
    const breakdownByWorkflow: Record<string, { executions: number; minutesSaved: number; minutesPerExecution: number }> = {};

    // Process non-shared executions
    for (const exec of filteredExecutions) {
      const workflowName = workflowIdToName.get(exec.workflowId) || `Workflow ${exec.workflowId}`;
      const info = workflowIdToInfo.get(exec.workflowId);

      if (!info || info.isShared) {
        continue; // Skip shared workflows for now, handled separately
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

    // Distribute shared workflow executions proportionally across eligible companies
    // SEO Blog -> distribute among companies with blogs_n8n_name configured
    if (sharedExecutionCounts.blogs > 0 && companiesWithBlogs.length > 0) {
      const executionsPerCompany = sharedExecutionCounts.blogs / companiesWithBlogs.length;
      const minutesPerCompany = executionsPerCompany * defaultBlogsTimeSaved;
      
      for (const company of companiesWithBlogs) {
        if (!breakdownByCompany[company.name].workflows['SEO Blog']) {
          breakdownByCompany[company.name].workflows['SEO Blog'] = {
            executions: 0,
            minutesSaved: 0,
          };
        }
        breakdownByCompany[company.name].workflows['SEO Blog'].executions += Math.round(executionsPerCompany);
        breakdownByCompany[company.name].workflows['SEO Blog'].minutesSaved += minutesPerCompany;
        breakdownByCompany[company.name].totalMinutes += minutesPerCompany;
      }
      
      totalExecutions += sharedExecutionCounts.blogs;
      totalSavedMinutes += sharedExecutionCounts.blogs * defaultBlogsTimeSaved;
      
      console.log(`Distributed ${sharedExecutionCounts.blogs} SEO Blog executions across ${companiesWithBlogs.length} companies`);
    }

    // SEO Zoekwoorden -> distribute among companies with seo_research_n8n_name configured
    if (sharedExecutionCounts.research > 0 && companiesWithResearch.length > 0) {
      const executionsPerCompany = sharedExecutionCounts.research / companiesWithResearch.length;
      const minutesPerCompany = executionsPerCompany * defaultZoekwoordTimeSaved;
      
      for (const company of companiesWithResearch) {
        if (!breakdownByCompany[company.name].workflows['SEO Zoekwoorden']) {
          breakdownByCompany[company.name].workflows['SEO Zoekwoorden'] = {
            executions: 0,
            minutesSaved: 0,
          };
        }
        breakdownByCompany[company.name].workflows['SEO Zoekwoorden'].executions += Math.round(executionsPerCompany);
        breakdownByCompany[company.name].workflows['SEO Zoekwoorden'].minutesSaved += minutesPerCompany;
        breakdownByCompany[company.name].totalMinutes += minutesPerCompany;
      }
      
      totalExecutions += sharedExecutionCounts.research;
      totalSavedMinutes += sharedExecutionCounts.research * defaultZoekwoordTimeSaved;
      
      console.log(`Distributed ${sharedExecutionCounts.research} SEO Zoekwoorden executions across ${companiesWithResearch.length} companies`);
    }

    // Calculate total hours per company and remove companies with 0 hours (except main ones)
    for (const company of Object.keys(breakdownByCompany)) {
      breakdownByCompany[company].totalHours = Math.round((breakdownByCompany[company].totalMinutes / 60) * 10) / 10;
    }

    // Remove "Overig" if it has no executions
    if (breakdownByCompany['Overig'].totalMinutes === 0) {
      delete breakdownByCompany['Overig'];
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
