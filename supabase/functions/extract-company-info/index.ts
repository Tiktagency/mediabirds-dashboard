import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const isUnsafeHost = (host: string): boolean => {
  const h = host.toLowerCase();
  if (h === 'localhost' || h.endsWith('.localhost') || h === 'metadata.google.internal') return true;
  const m = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (m) {
    const [a, b] = [parseInt(m[1]), parseInt(m[2])];
    if (a === 10 || a === 127 || a === 0) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a >= 224) return true;
  }
  if (h === '::1' || h.startsWith('[::1') || h.startsWith('fe80') || h.startsWith('fc') || h.startsWith('fd')) return true;
  return false;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { website } = await req.json();

    if (!website) {
      return new Response(
        JSON.stringify({ success: false, error: 'Website URL is vereist' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: 'AI gateway niet geconfigureerd' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let formattedUrl = website.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    console.log('Fetching HTML from:', formattedUrl);

    let html = '';
    try {
      const pageResponse = await fetch(formattedUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CompanyInfoExtractor/1.0)' },
        signal: AbortSignal.timeout(15000),
      });
      html = await pageResponse.text();
      console.log('HTML fetched, length:', html.length);
    } catch (fetchError) {
      console.error('Failed to fetch website:', fetchError);
      return new Response(
        JSON.stringify({ success: false, error: `Kon website niet ophalen: ${fetchError instanceof Error ? fetchError.message : 'Onbekende fout'}` }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Clean HTML: remove scripts, styles, comments — keep text content
    const cleanedHtml = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '')
      .substring(0, 80000);

    const systemPrompt = `Je bent een expert in bedrijfsanalyse. Je taak is om bedrijfsinformatie te extraheren uit de HTML broncode van een website.

ANALYSEVOLGORDE:
1. <title> tag, <meta name="description">, <meta property="og:title">, <meta property="og:description">
2. Hero/header sectie: h1, h2, subtitels, paragrafen in de eerste viewport
3. "Over ons" / "About" secties
4. CTA knoppen en links
5. Footer informatie

EXTRACTIEREGELS:
- bedrijfsnaam: De officiële naam van het bedrijf. Zoek in <title>, logo alt-tekst, footer copyright. Gebruik NIET de domeinnaam tenzij er niets anders is.
- tagline: Een korte slogan of ondertitel. Zoek in hero subtitle, <meta description>, of h2 direct na h1.
- bedrijfsomschrijving: Wat doet het bedrijf? Beschrijf in 2-3 zinnen. Gebruik about-sectie, meta description, of hero tekst.
- doelgroep: Voor wie is het bedrijf? Analyseer de taal, terminologie en content om de doelgroep af te leiden. Geef een korte beschrijving.
- toon: Analyseer de schrijfstijl van de website. Is het formeel, informeel, zakelijk, speels, technisch, mensgericht? Geef 2-3 woorden.
- cta_tekst: De tekst op de meest prominente CTA-knop. Zoek naar knoppen met klassen als .btn, .cta, button, a.button in de hero of header sectie.
- cta_url: De URL waarnaar de CTA-knop linkt. Geef de volledige URL (niet relatief).

Als een veld NIET gevonden kan worden, geef dan null terug. Verzin NOOIT informatie die niet op de website staat.`;

    const userPrompt = `Analyseer de website ${formattedUrl} en extraheer de bedrijfsinformatie.

== HTML BRONCODE ==
\`\`\`
${cleanedHtml}
\`\`\`

Gebruik de tool "extract_company_info" om de bedrijfsinformatie gestructureerd terug te geven.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'extract_company_info',
              description: 'Extraheer bedrijfsinformatie van de website.',
              parameters: {
                type: 'object',
                properties: {
                  bedrijfsnaam: { type: ['string', 'null'], description: 'Officiële bedrijfsnaam' },
                  tagline: { type: ['string', 'null'], description: 'Korte slogan of ondertitel' },
                  bedrijfsomschrijving: { type: ['string', 'null'], description: 'Wat doet het bedrijf (2-3 zinnen)' },
                  doelgroep: { type: ['string', 'null'], description: 'Voor wie is het bedrijf' },
                  toon: { type: ['string', 'null'], description: 'Schrijfstijl in 2-3 woorden' },
                  cta_tekst: { type: ['string', 'null'], description: 'Tekst op de prominentste CTA-knop' },
                  cta_url: { type: ['string', 'null'], description: 'URL van de CTA-knop (volledig)' },
                },
                required: ['bedrijfsnaam', 'tagline', 'bedrijfsomschrijving', 'doelgroep', 'toon', 'cta_tekst', 'cta_url'],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: 'function', function: { name: 'extract_company_info' } },
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: 'Te veel verzoeken. Probeer het later opnieuw.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ success: false, error: 'Krediet vereist. Voeg saldo toe aan je workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await aiResponse.text();
      console.error('AI gateway error:', aiResponse.status, errorText);
      return new Response(
        JSON.stringify({ success: false, error: 'AI gateway fout bij bedrijfsinfo extractie' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    console.log('AI response:', JSON.stringify(aiData, null, 2));

    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function?.name !== 'extract_company_info') {
      return new Response(
        JSON.stringify({ success: false, error: 'AI kon geen bedrijfsinformatie extraheren van deze website' }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let extractedInfo: Record<string, string | null>;
    try {
      extractedInfo = JSON.parse(toolCall.function.arguments);
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: 'Ongeldige data ontvangen van AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Clean nulls to empty strings for frontend convenience
    const result: Record<string, string> = {};
    for (const key of ['bedrijfsnaam', 'tagline', 'bedrijfsomschrijving', 'doelgroep', 'toon', 'cta_tekst', 'cta_url']) {
      result[key] = extractedInfo[key] || '';
    }

    console.log('Extracted company info:', result);

    return new Response(
      JSON.stringify({ success: true, info: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error extracting company info:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Onbekende fout' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
