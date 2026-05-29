import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TARGET_EMAIL = "hello@tikt.ai";
const TARGET_USER_ID = "858fbdeb-e892-45ff-8d95-299063068e0c";
const NEW_PASSWORD = "AfstuDeErProJect!";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: "Ontbrekende serverconfiguratie" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { data: existingUser, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(TARGET_USER_ID);

    if (getUserError || !existingUser?.user) {
      return new Response(JSON.stringify({ error: "Gebruiker niet gevonden op verwachte user-id" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(TARGET_USER_ID, {
      email: TARGET_EMAIL,
      password: NEW_PASSWORD,
      email_confirm: true,
      user_metadata: {
        ...(existingUser.user.user_metadata ?? {}),
        email: TARGET_EMAIL,
      },
    });

    if (updateError) {
      return new Response(JSON.stringify({ error: updateError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: updatedUser.user?.id,
          email: updatedUser.user?.email,
          email_confirmed_at: updatedUser.user?.email_confirmed_at,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});