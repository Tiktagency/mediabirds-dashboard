const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Validate and normalize hex color, return null if invalid
const toHex = (val: string | undefined | null): string | null => {
  if (!val) return null;
  const trimmed = val.trim();
  if (trimmed.startsWith('#') && (trimmed.length === 4 || trimmed.length === 7)) return trimmed;
  if (/^[0-9a-fA-F]{6}$/.test(trimmed)) return `#${trimmed}`;
  if (/^[0-9a-fA-F]{3}$/.test(trimmed)) return `#${trimmed}`;
  return null;
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

    // Fetch the website HTML
    let html = '';
    try {
      const pageResponse = await fetch(formattedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; BrandColorExtractor/1.0)',
        },
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

    // Trim HTML to avoid exceeding token limits — keep head (CSS vars, inline styles) and body structure
    // Remove script content but keep style content (important for CSS variables and colors)
    const cleanedHtml = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '')
      .substring(0, 80000);

    console.log('Cleaned HTML length:', cleanedHtml.length);

    const systemPrompt = `Je bent een expert in webdesign en huisstijlanalyse. Je taak is om de merkidentiteitskleuren van een website te extraheren uit de HTML/CSS broncode.

KRITIEKE REGELS:
1. Gebruik ALLEEN kleuren van vaste UI-elementen: achtergronden, tekst, knoppen, navigatie, headers, footers, kaarten, formulieren
2. Gebruik NOOIT kleuren van afbeeldingen, foto's of SVG-iconen die decoratief zijn
3. Analyseer inline CSS, <style> tags, CSS-variabelen (--color-*, --primary, etc.) en Tailwind/Bootstrap klassen
4. Knoppen hebben bijna altijd WITTE tekst (#FFFFFF) — gebruik dit als standaard voor cta_tekst_kleur tenzij de knoptekst duidelijk donker is
5. Dezelfde kleur mag voor meerdere velden worden gebruikt als dat logisch is
6. Geef altijd geldige hex-kleuren terug (#RRGGBB formaat)
7. Als een kleur niet duidelijk te bepalen is, gebruik een logische fallback die past bij de rest van het kleurenschema`;

    const userPrompt = `Analyseer de volgende HTML van de website ${formattedUrl} en extraheer de 10 merkidentiteitskleuren.

HTML:
\`\`\`
${cleanedHtml}
\`\`\`

Gebruik de tool "extract_brand_colors" om de kleuren terug te geven.`;

    // Call Gemini via Lovable AI Gateway with tool calling
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'extract_brand_colors',
              description: 'Extraheer de 10 merkidentiteitskleuren van de website',
              parameters: {
                type: 'object',
                properties: {
                  primaire_kleur: {
                    type: 'string',
                    description: 'De primaire merkkleur — de meest gebruikte accentkleur, vaak de knopkleur (#RRGGBB)',
                  },
                  secundaire_kleur: {
                    type: 'string',
                    description: 'De secundaire merkkleur — complementair aan de primaire kleur (#RRGGBB)',
                  },
                  achtergrond_kleur: {
                    type: 'string',
                    description: 'De hoofdachtergrondkleur van de pagina (#RRGGBB)',
                  },
                  kaart_achtergrond: {
                    type: 'string',
                    description: 'Achtergrondkleur van kaarten, blokken of secties (#RRGGBB)',
                  },
                  tekst_kleur: {
                    type: 'string',
                    description: 'Primaire tekstkleur voor koppen en bodytekst (#RRGGBB)',
                  },
                  subtekst_kleur: {
                    type: 'string',
                    description: 'Secundaire tekstkleur voor subtekst, metadata, labels (#RRGGBB)',
                  },
                  accent_kleur: {
                    type: 'string',
                    description: 'Accentkleur voor highlights, links, actieve states (#RRGGBB)',
                  },
                  cta_tekst_kleur: {
                    type: 'string',
                    description: 'Tekstkleur in call-to-action knoppen — bijna altijd #FFFFFF (wit) (#RRGGBB)',
                  },
                  footer_achtergrond: {
                    type: 'string',
                    description: 'Achtergrondkleur van de footer (#RRGGBB)',
                  },
                  footer_tekst_kleur: {
                    type: 'string',
                    description: 'Tekstkleur in de footer — wit op donkere footer, donker op lichte footer (#RRGGBB)',
                  },
                },
                required: [
                  'primaire_kleur', 'secundaire_kleur', 'achtergrond_kleur', 'kaart_achtergrond',
                  'tekst_kleur', 'subtekst_kleur', 'accent_kleur', 'cta_tekst_kleur',
                  'footer_achtergrond', 'footer_tekst_kleur',
                ],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: 'function', function: { name: 'extract_brand_colors' } },
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
        JSON.stringify({ success: false, error: 'AI gateway fout bij kleurextractie' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    console.log('AI response:', JSON.stringify(aiData, null, 2));

    // Extract tool call result
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function?.name !== 'extract_brand_colors') {
      return new Response(
        JSON.stringify({ success: false, error: 'AI kon geen merkidentiteitskleuren extraheren van deze website' }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let extractedColors: Record<string, string>;
    try {
      extractedColors = JSON.parse(toolCall.function.arguments);
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: 'Ongeldige kleurendata ontvangen van AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate and normalize all colors
    const mappedColors = {
      primaire_kleur: toHex(extractedColors.primaire_kleur) || '#000000',
      secundaire_kleur: toHex(extractedColors.secundaire_kleur) || toHex(extractedColors.primaire_kleur) || '#000000',
      achtergrond_kleur: toHex(extractedColors.achtergrond_kleur) || '#FFFFFF',
      kaart_achtergrond: toHex(extractedColors.kaart_achtergrond) || toHex(extractedColors.achtergrond_kleur) || '#FFFFFF',
      tekst_kleur: toHex(extractedColors.tekst_kleur) || '#1A1A1A',
      subtekst_kleur: toHex(extractedColors.subtekst_kleur) || toHex(extractedColors.tekst_kleur) || '#6B7280',
      accent_kleur: toHex(extractedColors.accent_kleur) || toHex(extractedColors.primaire_kleur) || '#000000',
      cta_tekst_kleur: toHex(extractedColors.cta_tekst_kleur) || '#FFFFFF',
      footer_achtergrond: toHex(extractedColors.footer_achtergrond) || toHex(extractedColors.secundaire_kleur) || toHex(extractedColors.primaire_kleur) || '#000000',
      footer_tekst_kleur: toHex(extractedColors.footer_tekst_kleur) || '#FFFFFF',
    };

    console.log('Mapped colors:', mappedColors);

    return new Response(
      JSON.stringify({ success: true, colors: mappedColors }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error extracting brand colors:', error);
    const errorMessage = error instanceof Error ? error.message : 'Onbekende fout';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
