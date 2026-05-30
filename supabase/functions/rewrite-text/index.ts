import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Require authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const authClient = createClient(supabaseUrl!, supabaseAnonKey!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: authError } = await authClient.auth.getUser();
    if (authError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Copyright branding is toegestaan voor demo-accounts.




    const { personalities, postType, subject, wordCount, extraDescription, oldText, mode } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const personalityLabels: Record<string, string> = {
      professioneel: "Professioneel",
      informeel: "Informeel",
      enthousiast: "Enthousiast",
      zakelijk: "Zakelijk",
      creatief: "Creatief",
      humoristisch: "Humoristisch",
      empathisch: "Empathisch",
      autoritair: "Autoritair",
      inspirerend: "Inspirerend",
      educatief: "Educatief",
      betrouwbaar: "Betrouwbaar",
      innovatief: "Innovatief",
    };

    const postTypeLabels: Record<string, string> = {
      website: "website pagina",
      blogpagina: "blog artikel",
      socialmedia: "social media post",
      nieuwsbrief: "nieuwsbrief",
      advertentie: "advertentie tekst",
    };

    const selectedPersonalities = personalities.map((p: string) => personalityLabels[p] || p).join(" en ");
    const postTypeLabel = postTypeLabels[postType] || postType;

    let systemPrompt = `Je bent een professionele copywriter die gespecialiseerd is in het schrijven van teksten met verschillende persoonlijkheden en stijlen.

Je schrijft altijd in het Nederlands tenzij anders aangegeven.

KRITIEKE REGEL - WOORDLIMIET:
- De gebruiker heeft een MAXIMUM van ${wordCount} woorden opgegeven
- Je mag dit aantal NOOIT overschrijden
- Tel je woorden zorgvuldig en blijf ONDER de limiet
- Het is beter om iets korter te schrijven dan over de limiet te gaan

Je schrijft teksten die:
- Authentiek en natuurlijk klinken
- Passen bij de gekozen persoonlijkheidstype(s)
- Geschikt zijn voor het gekozen type content
- STRIKT binnen het maximum aantal woorden blijven

Persoonlijkheidskenmerken:
- Professioneel: Formeel, betrouwbaar, expert-niveau taalgebruik
- Informeel: Casual, vriendelijk, toegankelijk
- Enthousiast: Energiek, positief, inspirerend
- Zakelijk: To-the-point, resultaatgericht, efficiënt
- Creatief: Origineel, verrassend, artistiek
- Humoristisch: Luchtig, grappig, speels
- Empathisch: Begripvol, warm, verbindend
- Autoritair: Stellig, overtuigend, leidend
- Inspirerend: Motiverend, visionair, verheffend
- Educatief: Informatief, verhelderend, leerzaam
- Betrouwbaar: Eerlijk, consistent, vertrouwenwekkend
- Innovatief: Vooruitstrevend, modern, trendsettend`;

    let userPrompt: string;

    if (mode === "rewrite" && oldText) {
      userPrompt = `Herschrijf de volgende tekst in een ${selectedPersonalities} stijl, geschikt voor een ${postTypeLabel}.

Onderwerp: ${subject}
MAXIMUM aantal woorden: ${wordCount} (NIET overschrijden!)
${extraDescription ? `Extra instructies: ${extraDescription}` : ""}

Originele tekst om te herschrijven:
"""
${oldText}
"""

Herschrijf deze tekst met behoud van de kernboodschap, maar pas de toon en stijl aan naar ${selectedPersonalities}. 
BELANGRIJK: Blijf STRIKT onder de ${wordCount} woorden. Geef alleen de herschreven tekst terug, zonder uitleg of commentaar.`;
    } else {
      userPrompt = `Schrijf een ${postTypeLabel} over "${subject}" in een ${selectedPersonalities} stijl.

MAXIMUM aantal woorden: ${wordCount} (NIET overschrijden!)
${extraDescription ? `Extra instructies: ${extraDescription}` : ""}

Schrijf alleen de tekst, zonder titels, headers of extra uitleg. De tekst moet direct bruikbaar zijn.
BELANGRIJK: Blijf STRIKT onder de ${wordCount} woorden.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Te veel verzoeken. Probeer het later opnieuw." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Krediet vereist. Voeg saldo toe aan je workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const generatedText = data.choices?.[0]?.message?.content || "";

    // Track usage in automation_status
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      
      if (supabaseUrl && serviceRoleKey) {
        const supabase = createClient(supabaseUrl, serviceRoleKey);
        await supabase
          .from("automation_status")
          .upsert({
            automation_name: "copyright-branding",
            status: "active",
            last_run: new Date().toISOString(),
            last_updated: new Date().toISOString(),
          }, { onConflict: "automation_name" });
      }
    } catch (trackingError) {
      console.error("Failed to track usage:", trackingError);
      // Don't fail the request if tracking fails
    }

    return new Response(
      JSON.stringify({ text: generatedText }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("rewrite-text error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
