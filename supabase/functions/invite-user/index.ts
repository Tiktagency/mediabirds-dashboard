import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

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

    const { email, role, redirectUrl } = await req.json();
    console.log(`Inviting user: ${email} with role: ${role}`);

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase());

    if (existingUser) {
      return new Response(JSON.stringify({ error: 'Gebruiker bestaat al' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate a temporary password
    const tempPassword = crypto.randomUUID().slice(0, 12) + 'Aa1!';

    // Create user with Supabase Admin API
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
    });

    if (createError) {
      console.error('Create user error:', createError);
      throw createError;
    }

    // Assign role to new user
    if (newUser?.user) {
      const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .insert({ user_id: newUser.user.id, role });

      if (roleError) {
        console.error('Role assignment error:', roleError);
        // Try to clean up the user if role assignment fails
        await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
        throw roleError;
      }
    }

    // Send invitation email
    const loginUrl = redirectUrl || 'https://audrvgrsuleruuspwnhf.lovableproject.com/login';
    const roleLabel = role === 'admin' ? 'Administrator' : role === 'operator' ? 'Operator' : 'Viewer';
    
    let emailSent = false;
    let emailError = null;
    
    try {
      const { error: resendError } = await resend.emails.send({
        from: 'TIKT Dashboard <onboarding@resend.dev>',
        to: [email],
        subject: 'Je bent uitgenodigd voor het TIKT Dashboard',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">TIKT Dashboard</h1>
            </div>
            
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none;">
              <h2 style="color: #1f2937; margin-top: 0;">Welkom!</h2>
              
              <p>Je bent uitgenodigd om toegang te krijgen tot het TIKT Dashboard met de rol:</p>
              
              <div style="background: #8f13e2; color: white; display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: 600; margin: 10px 0;">
                ${roleLabel}
              </div>
              
              <h3 style="color: #1f2937; margin-top: 25px;">Je inloggegevens:</h3>
              
              <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 15px 0;">
                <p style="margin: 5px 0;"><strong>E-mail:</strong> ${email}</p>
                <p style="margin: 5px 0;"><strong>Tijdelijk wachtwoord:</strong></p>
                <code style="background: #f3f4f6; padding: 10px 15px; border-radius: 5px; display: block; font-size: 16px; letter-spacing: 1px; margin-top: 5px;">${tempPassword}</code>
              </div>
              
              <a href="${loginUrl}" style="display: inline-block; background: #8f13e2; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0;">
                Inloggen op het Dashboard
              </a>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 25px;">
                <strong>⚠️ Belangrijk:</strong> Wijzig je wachtwoord na je eerste login voor optimale beveiliging.
              </p>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
              <p>Deze e-mail is verzonden door het TIKT Dashboard.<br>Heb je vragen? Neem contact op met je administrator.</p>
            </div>
          </body>
          </html>
        `,
      });

      if (resendError) {
        console.error('Email send error:', resendError);
        emailError = resendError.message;
      } else {
        emailSent = true;
        console.log(`Invitation email sent to ${email}`);
      }
    } catch (e) {
      console.error('Email send exception:', e);
      emailError = e.message;
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: emailSent 
        ? 'Gebruiker uitgenodigd en e-mail verzonden' 
        : 'Gebruiker aangemaakt maar e-mail niet verzonden',
      tempPassword,
      emailSent,
      emailError
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in invite-user:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
