import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation helpers
function validateAutomationName(name: unknown): string {
  if (typeof name !== 'string' || !name.trim()) {
    throw new Error('automation_name is required');
  }
  // Limit length and sanitize
  const sanitized = name.trim().slice(0, 100);
  // Only allow alphanumeric, underscore, hyphen
  if (!/^[a-zA-Z0-9_-]+$/.test(sanitized)) {
    throw new Error('automation_name contains invalid characters');
  }
  return sanitized;
}

function validateStatus(status: unknown): string {
  if (typeof status !== 'string') {
    throw new Error('status must be a string');
  }
  const validStatuses = ['active', 'running', 'inactive'];
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }
  return status;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate user token
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const adminClientGuard = createClient(supabaseUrl, supabaseServiceKey);
    const { data: isDemo } = await adminClientGuard.rpc('is_demo_user', { _user_id: user.id });
    if (isDemo) {
      return new Response(
        JSON.stringify({ success: false, error: 'Demo-account: actie niet toegestaan' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse and validate input
    const body = await req.json();
    const automation_name = validateAutomationName(body.automation_name);
    const status = validateStatus(body.status);
    const last_run = body.last_run;

    // Use service role for database update
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Update or insert automation status
    const updateData: Record<string, unknown> = {
      automation_name,
      status,
      last_updated: new Date().toISOString(),
    };

    if (last_run) {
      updateData.last_run = last_run;
    }

    const { error } = await supabase
      .from('automation_status')
      .upsert(updateData, {
        onConflict: 'automation_name'
      });

    if (error) {
      console.error("Database error");
      throw new Error('Failed to update status');
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        automation_name,
        status
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in update-automation-status function');
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
