import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(
      authHeader.replace("Bearer ", "")
    );
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { company_id, bedrijfsnaam, domain } = await req.json();

    // Fetch the company's app_password server-side using the service role key
    // The password is never sent to or from the frontend
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const userId = (claimsData.claims as any).sub;
    const { data: isDemo } = await supabaseAdmin.rpc('is_demo_user', { _user_id: userId });
    if (isDemo) {
      return new Response(JSON.stringify({ error: 'Demo-account: automatiseringen starten is uitgeschakeld.' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }


    let app_password: string | null = null;
    if (company_id) {
      const { data: company } = await supabaseAdmin
        .from('alt_text_companies')
        .select('app_password')
        .eq('id', company_id)
        .maybeSingle();
      app_password = company?.app_password || null;
    }

    const webhookUrl =
      "https://tikt.app.n8n.cloud/webhook/b6d054ac-4c1b-4091-8369-f3f7e1bbca72";
    const authToken = Deno.env.get("BLOG_WEBHOOK_AUTH_TOKEN");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300_000);
    let webhookResponse: Response;
    try {
      webhookResponse = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${authToken}`,
        },
        body: JSON.stringify({ bedrijfsnaam, domain, app_password }),
        signal: controller.signal,
      });
    } catch (e) {
      clearTimeout(timeoutId);
      if ((e as any).name === "AbortError") {
        return new Response(
          JSON.stringify({ success: false, error: "Timeout: webhook gaf geen antwoord binnen 5 minuten" }),
          { status: 504, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw e;
    }
    clearTimeout(timeoutId);

    const responseData = await webhookResponse.text();

    return new Response(
      JSON.stringify({ success: webhookResponse.ok, data: responseData }),
      {
        status: webhookResponse.ok ? 200 : 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
