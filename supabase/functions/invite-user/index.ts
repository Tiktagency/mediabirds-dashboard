import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation helpers
function validateEmail(email: unknown): string {
  if (typeof email !== 'string' || !email.trim()) {
    throw new Error('Email is required');
  }
  const trimmed = email.trim().toLowerCase();
  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    throw new Error('Invalid email format');
  }
  // Limit length
  if (trimmed.length > 254) {
    throw new Error('Email is too long');
  }
  return trimmed;
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
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
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

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Niet geauthenticeerd' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user is admin
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

    // Parse and validate input
    const body = await req.json();
    const email = validateEmail(body.email);
    const role = validateRole(body.role);

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email?.toLowerCase() === email);

    if (existingUser) {
      return new Response(JSON.stringify({ error: 'Gebruiker bestaat al' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create user with password reset flow instead of temp password
    // This is more secure as no password is transmitted via webhook
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true,
    });

    if (createError) {
      console.error('Create user error');
      throw createError;
    }

    // Assign role to new user
    if (newUser?.user) {
      const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .insert({ user_id: newUser.user.id, role });

      if (roleError) {
        console.error('Role assignment error');
        // Try to clean up the user if role assignment fails
        await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
        throw roleError;
      }
    }

    // Generate a password reset link that the user must use to set their password
    const dashboardUrl = 'https://audrvgrsuleruuspwnhf.lovableproject.com';
    const { data: resetData, error: resetError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: {
        redirectTo: `${dashboardUrl}/login`,
      }
    });

    if (resetError) {
      console.error('Password reset link generation error');
    }

    // Send invitation data to n8n webhook - WITHOUT the password!
    // The user will receive a password reset link instead
    const webhookUrl = 'https://tikt.app.n8n.cloud/webhook/mediabirds-invite';
    try {
      const webhookResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          role,
          // Send the secure reset link instead of temp password
          resetLink: resetData?.properties?.action_link || null,
          dashboardUrl
          // NO tempPassword - this is the security fix!
        })
      });
      console.log('Webhook completed with status:', webhookResponse.status);
    } catch (webhookError) {
      console.error('Webhook error (non-blocking)');
      // Don't fail the invite if webhook fails
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Gebruiker aangemaakt. Een wachtwoord reset link is verzonden.',
      // Return the reset link to admin so they can share it if webhook fails
      resetLink: resetData?.properties?.action_link || null
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in invite-user');
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
