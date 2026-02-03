import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation helpers
function validateAction(action: unknown): 'assign-role' | 'remove-role' | 'delete-user' {
  if (typeof action !== 'string') {
    throw new Error('Action must be a string');
  }
  const validActions = ['assign-role', 'remove-role', 'delete-user'];
  if (!validActions.includes(action)) {
    throw new Error(`Action must be one of: ${validActions.join(', ')}`);
  }
  return action as 'assign-role' | 'remove-role' | 'delete-user';
}

function validateUUID(uuid: unknown, fieldName: string): string {
  if (typeof uuid !== 'string') {
    throw new Error(`${fieldName} must be a string`);
  }
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(uuid)) {
    throw new Error(`${fieldName} must be a valid UUID`);
  }
  return uuid;
}

function validateRole(role: unknown): 'admin' | 'operator' | 'viewer' {
  if (typeof role !== 'string') {
    throw new Error('Role must be a string');
  }
  const validRoles = ['admin', 'operator', 'viewer'];
  if (!validRoles.includes(role)) {
    throw new Error(`Role must be one of: ${validRoles.join(', ')}`);
  }
  return role as 'admin' | 'operator' | 'viewer';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Create client with user's auth token to verify they're admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Geen autorisatie header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Niet geauthenticeerd' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user is admin or super_admin using service role
    const { data: adminCheck } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['admin', 'super_admin']);

    if (!adminCheck || adminCheck.length === 0) {
      return new Response(JSON.stringify({ error: 'Geen admin rechten' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse and validate input
    const body = await req.json();
    const action = validateAction(body.action);
    const userId = validateUUID(body.userId, 'userId');

    switch (action) {
      case 'assign-role': {
        const role = validateRole(body.role);
        
        // First remove existing roles
        await supabaseAdmin
          .from('user_roles')
          .delete()
          .eq('user_id', userId);

        // Add new role
        const { error: insertError } = await supabaseAdmin
          .from('user_roles')
          .insert({ user_id: userId, role });

        if (insertError) {
          console.error('Insert error');
          throw insertError;
        }

        return new Response(JSON.stringify({ success: true, message: 'Rol toegewezen' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'remove-role': {
        const role = validateRole(body.role);
        
        const { error: deleteError } = await supabaseAdmin
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', role);

        if (deleteError) throw deleteError;

        return new Response(JSON.stringify({ success: true, message: 'Rol verwijderd' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'delete-user': {
        // Delete user roles
        await supabaseAdmin
          .from('user_roles')
          .delete()
          .eq('user_id', userId);

        // Delete user permissions
        await supabaseAdmin
          .from('user_automation_permissions')
          .delete()
          .eq('user_id', userId);

        // Delete user profile
        await supabaseAdmin
          .from('profiles')
          .delete()
          .eq('id', userId);

        // Delete auth user
        const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
        if (authDeleteError) {
          console.error('Auth delete error');
          throw authDeleteError;
        }

        return new Response(JSON.stringify({ success: true, message: 'Gebruiker verwijderd' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'Onbekende actie' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    console.error('Error in manage-user-roles');
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
