import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

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
    console.log("Updating automation status");
    
    const { automation_name, status, last_run } = await req.json();
    
    if (!automation_name || !status) {
      throw new Error('automation_name and status are required');
    }

    // Validate status
    const validStatuses = ['active', 'running', 'inactive'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Update or insert automation status
    const updateData: any = {
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
      console.error("Error updating automation status:", error);
      throw error;
    }

    console.log(`Status updated for ${automation_name}: ${status}`);

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
    console.error('Error in update-automation-status function:', error);
    
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