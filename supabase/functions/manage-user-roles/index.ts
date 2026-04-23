import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // Check if user is admin using service role
    const { data: adminCheck } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!adminCheck) {
      return new Response(JSON.stringify({ error: 'Geen admin rechten' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { action, userId, role } = await req.json();
    console.log(`Action: ${action}, UserId: ${userId}, Role: ${role}`);

    switch (action) {
      case 'assign-role': {
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
          console.error('Insert error:', insertError);
          throw insertError;
        }

        return new Response(JSON.stringify({ success: true, message: 'Rol toegewezen' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'remove-role': {
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
          console.error('Auth delete error:', authDeleteError);
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
    console.error('Error in manage-user-roles:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
