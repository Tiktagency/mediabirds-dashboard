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

interface Company {
  id: string;
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
  return 'Overig';
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
  let callerUserId: string | null = null;
  let callerEmail: string | null = null;
  {
    const sUrl = Deno.env.get('SUPABASE_URL')!;
    const sKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const authClient = createClient(sUrl, sKey, { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error: userErr } = await authClient.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    callerUserId = user.id;
    callerEmail = (user.email || '').toLowerCase();
  }

  // ========================================
  // DEMO ACCOUNT: return fixed mock data (75.2 hours)
  // ========================================
  {
    const sUrl = Deno.env.get('SUPABASE_URL')!;
    const svcKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const svc = createClient(sUrl, svcKey);
    const { data: profile } = await svc
      .from('profiles')
      .select('is_demo')
      .eq('id', callerUserId)
      .maybeSingle();
    const isDemo = callerEmail === 'luc.degraag@student.hu.nl' || !!profile?.is_demo;
    if (isDemo) {
      const periodEnd = new Date();
      const periodStart = new Date();
      periodStart.setDate(periodStart.getDate() - 30);

      const breakdownByCompany = {
        'Mediabirds': {
          totalMinutes: 3000,
          totalHours: 50.0,
          workflows: {
            'SEO Blog':         { executions: 40, minutesSaved: 1200 },
            'SEO Zoekwoorden':  { executions: 30, minutesSaved: 900 },
            'Monday Planning':  { executions: 16, minutesSaved: 720 },
            'Alt-text':         { executions: 60, minutesSaved: 180 },
          },
        },
        'Demo Bakkerij': {
          totalMinutes: 900,
          totalHours: 15.0,
          workflows: {
            'SEO Blog':  { executions: 20, minutesSaved: 600 },
            'Alt-text':  { executions: 100, minutesSaved: 300 },
          },
        },
        'Demo Webshop': {
          totalMinutes: 612,
          totalHours: 10.2,
          workflows: {
            'SEO Blog':  { executions: 18, minutesSaved: 540 },
            'Alt-text':  { executions: 24, minutesSaved: 72 },
          },
        },
      };

      return new Response(JSON.stringify({
        totalHours: 75.2,
        totalMinutes: 4512,
        executionCount: 308,
        periodStart: periodStart.toISOString(),
        periodEnd: periodEnd.toISOString(),
        breakdownByCompany,
      }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
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

    // Calculate date range for past 30 days
    const periodEnd = new Date();
    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() - 30);
    console.log(`Fetching data from the last 30 days (since ${periodStart.toISOString()})`);

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
      .select('id, name, seo_research_n8n_name, subkeywords_n8n_name, blogs_n8n_name');

    if (companiesError) {
      console.error('Error fetching companies:', companiesError);
    }

    const allCompanies: Company[] = companies || [];
    const companyNames: string[] = allCompanies.map(c => c.name);
    const companyIdToName: Record<string, string> = {};
    for (const company of allCompanies) {
      companyIdToName[company.id] = company.name;
    }
    
    console.log('All companies:', companyNames);

    // ========================================
    // STEP 1: Get accurate SEO data from workflow_executions table
    // ========================================
    const { data: workflowExecutions, error: execError } = await supabase
      .from('workflow_executions')
      .select('company_id, workflow_type')
      .gte('triggered_at', periodStart.toISOString())
      .eq('success', true);

    if (execError) {
      console.error('Error fetching workflow_executions:', execError);
    }

    // Count executions per company from our accurate tracking table
    const accurateCounts: Record<string, { seo_blog: number; seo_research: number }> = {};
    
    if (workflowExecutions) {
      for (const exec of workflowExecutions) {
        const companyName = companyIdToName[exec.company_id];
        if (!companyName) continue;
        
        if (!accurateCounts[companyName]) {
          accurateCounts[companyName] = { seo_blog: 0, seo_research: 0 };
        }
        
        if (exec.workflow_type === 'seo_blog') {
          accurateCounts[companyName].seo_blog++;
        } else if (exec.workflow_type === 'seo_research') {
          accurateCounts[companyName].seo_research++;
        }
      }
    }
    
    console.log('Accurate SEO counts from workflow_executions:', JSON.stringify(accurateCounts));

    // ========================================
    // STEP 2: Build workflow mapping for n8n (excluding SEO Blog and SEO Zoekwoorden)
    // ========================================
    const exactMatchMap: Record<string, WorkflowInfo> = {};

    // Only map company-specific workflows that are NOT the shared SEO workflows
    for (const company of allCompanies) {
      if (company.subkeywords_n8n_name) {
        exactMatchMap[company.subkeywords_n8n_name.toLowerCase()] = {
          timeSaved: defaultZoekwoordTimeSaved,
          companyName: company.name,
          workflowType: 'Subkeywords',
        };
      }
    }

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
    // EXCLUDE SEO Blog and SEO Zoekwoorden - those come from workflow_executions
    const workflowIdToName = new Map<string, string>();
    const workflowIdToInfo = new Map<string, WorkflowInfo>();
    
    workflows.forEach((w: any) => {
      workflowIdToName.set(w.id, w.name);
      const workflowNameLower = w.name.toLowerCase();
      
      // Skip generic SEO workflows - we track those in workflow_executions
      if (workflowNameLower === 'seo blog' || workflowNameLower === 'seo blogs' ||
          workflowNameLower === 'seo zoekwoorden' || workflowNameLower === 'seo zoekwoord' ||
          workflowNameLower === 'seo keywords') {
        console.log(`Skipping "${w.name}" - tracked via workflow_executions`);
        return;
      }
      
      // Also skip company-specific SEO workflows (e.g., "MEDIABIRDS zoekwoorden")
      // These should also be tracked via workflow_executions going forward
      const workflowType = determineWorkflowType(w.name);
      if (workflowNameLower.includes('zoekwoord') || workflowNameLower.includes('blog')) {
        // Check if this is a company-prefixed SEO workflow
        const companyFromPrefix = extractCompanyFromWorkflowName(w.name, companyNames);
        if (companyFromPrefix) {
          console.log(`Skipping "${w.name}" - company SEO workflow, should use workflow_executions`);
          return;
        }
      }
      
      // Priority 1: Exact match in companies table (for subkeywords etc.)
      if (exactMatchMap[workflowNameLower]) {
        workflowIdToInfo.set(w.id, exactMatchMap[workflowNameLower]);
        console.log(`Matched "${w.name}" via exact match -> ${exactMatchMap[workflowNameLower].companyName}`);
        return;
      }
      
      // Priority 2: Company prefix match (e.g., "MEDIABIRDS Alt-text" -> Mediabirds)
      const companyFromPrefix = extractCompanyFromWorkflowName(w.name, companyNames);
      if (companyFromPrefix) {
        let timeSaved = timeSavedMap[workflowNameLower];
        
        // If no exact time saved, use default based on workflow type
        if (!timeSaved) {
          if (workflowType === 'Alt-text') timeSaved = defaultAltTextTimeSaved;
          else if (workflowType === 'Monday Planning') timeSaved = defaultMondayTimeSaved;
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
      
      // Priority 3: Generic workflows go to Mediabirds (was "Overig")
      if (timeSavedMap[workflowNameLower] && timeSavedMap[workflowNameLower] > 0) {
        workflowIdToInfo.set(w.id, {
          timeSaved: timeSavedMap[workflowNameLower],
          companyName: 'Mediabirds', // "Overig" now goes to Mediabirds
          workflowType,
        });
        console.log(`Matched "${w.name}" via automation_settings -> Mediabirds (${workflowType})`);
        return;
      }
      
      // Priority 4: Contains match for automation_settings entries
      for (const [key, timeSaved] of Object.entries(timeSavedMap)) {
        if (timeSaved > 0 && (workflowNameLower.includes(key) || key.includes(workflowNameLower))) {
          workflowIdToInfo.set(w.id, {
            timeSaved,
            companyName: 'Mediabirds', // "Overig" now goes to Mediabirds
            workflowType,
          });
          console.log(`Matched "${w.name}" via contains match -> Mediabirds (${workflowType})`);
          return;
        }
      }
    });

    // Find workflow IDs that have configured info
    const targetWorkflowIds: string[] = Array.from(workflowIdToInfo.keys());
    console.log(`Found ${targetWorkflowIds.length} matching n8n workflows (excluding SEO)`);

    // ========================================
    // STEP 3: Fetch n8n executions (for non-SEO workflows)
    // ========================================
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

      const executionsResponse = await fetch(executionsUrl, {
        method: 'GET',
        headers: {
          'X-N8N-API-KEY': n8nApiKey,
          'Content-Type': 'application/json',
        },
      });

      if (!executionsResponse.ok) {
        console.error(`Failed to fetch executions: ${executionsResponse.status}`);
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
        hasMore = false;
        break;
      }

      cursor = executionsData.nextCursor;
      if (!cursor) {
        hasMore = false;
      }
    }

    console.log(`Fetched ${allExecutions.length} successful executions from ${pageCount} pages`);

    // Filter to only target workflows (non-SEO)
    const filteredExecutions = allExecutions.filter(e => 
      targetWorkflowIds.includes(e.workflowId)
    );
    console.log(`Filtered to ${filteredExecutions.length} executions for non-SEO workflows`);

    // ========================================
    // STEP 4: Calculate breakdown per company
    // ========================================
    const breakdownByCompany: Record<string, { 
      totalMinutes: number; 
      totalHours: number; 
      workflows: Record<string, { executions: number; minutesSaved: number }> 
    }> = {};
    
    // Initialize all companies in breakdown
    for (const company of allCompanies) {
      breakdownByCompany[company.name] = {
        totalMinutes: 0,
        totalHours: 0,
        workflows: {},
      };
    }

    // Add SEO data from workflow_executions (accurate per-company)
    for (const [companyName, counts] of Object.entries(accurateCounts)) {
      if (!breakdownByCompany[companyName]) {
        breakdownByCompany[companyName] = {
          totalMinutes: 0,
          totalHours: 0,
          workflows: {},
        };
      }
      
      if (counts.seo_blog > 0) {
        const minutesSaved = counts.seo_blog * defaultBlogsTimeSaved;
        breakdownByCompany[companyName].workflows['SEO Blog'] = {
          executions: counts.seo_blog,
          minutesSaved,
        };
        breakdownByCompany[companyName].totalMinutes += minutesSaved;
        console.log(`Added ${counts.seo_blog} SEO Blog executions for ${companyName} (${minutesSaved} min)`);
      }
      
      if (counts.seo_research > 0) {
        const minutesSaved = counts.seo_research * defaultZoekwoordTimeSaved;
        breakdownByCompany[companyName].workflows['SEO Zoekwoorden'] = {
          executions: counts.seo_research,
          minutesSaved,
        };
        breakdownByCompany[companyName].totalMinutes += minutesSaved;
        console.log(`Added ${counts.seo_research} SEO Zoekwoorden executions for ${companyName} (${minutesSaved} min)`);
      }
    }

    // Add n8n data for other workflows
    let totalSavedMinutes = 0;
    let totalExecutions = 0;
    const breakdownByWorkflow: Record<string, { executions: number; minutesSaved: number; minutesPerExecution: number }> = {};

    for (const exec of filteredExecutions) {
      const workflowName = workflowIdToName.get(exec.workflowId) || `Workflow ${exec.workflowId}`;
      const info = workflowIdToInfo.get(exec.workflowId);

      if (!info) continue;

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

    // Add SEO executions to totals
    for (const [companyName, counts] of Object.entries(accurateCounts)) {
      totalExecutions += counts.seo_blog + counts.seo_research;
      totalSavedMinutes += counts.seo_blog * defaultBlogsTimeSaved;
      totalSavedMinutes += counts.seo_research * defaultZoekwoordTimeSaved;
    }

    // Calculate total hours per company
    for (const company of Object.keys(breakdownByCompany)) {
      breakdownByCompany[company].totalHours = Math.round((breakdownByCompany[company].totalMinutes / 60) * 10) / 10;
    }

    // Remove companies with 0 hours (except Mediabirds which is our main company)
    for (const company of Object.keys(breakdownByCompany)) {
      if (breakdownByCompany[company].totalMinutes === 0 && company !== 'Mediabirds') {
        delete breakdownByCompany[company];
      }
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
