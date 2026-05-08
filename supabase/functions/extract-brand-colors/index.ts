import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// SSRF guard: reject private/loopback/link-local hostnames
const isUnsafeHost = (host: string): boolean => {
  const h = host.toLowerCase();
  if (h === 'localhost' || h.endsWith('.localhost') || h === 'metadata.google.internal') return true;
  // IPv4 literal
  const m = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (m) {
    const [a, b] = [parseInt(m[1]), parseInt(m[2])];
    if (a === 10) return true;
    if (a === 127) return true;
    if (a === 0) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a >= 224) return true;
  }
  // IPv6 loopback / link-local / ULA
  if (h === '::1' || h.startsWith('[::1') || h.startsWith('fe80') || h.startsWith('fc') || h.startsWith('fd')) return true;
  return false;
};

// Validate and normalize hex color, return null if invalid
// Expands 3-char hex to 6-char: #F0A → #FF00AA
const toHex = (val: string | undefined | null): string | null => {
  if (!val) return null;
  const trimmed = val.trim();
  // Already valid 6-char hex
  if (trimmed.startsWith('#') && trimmed.length === 7 && /^#[0-9a-fA-F]{6}$/.test(trimmed)) return trimmed.toUpperCase();
  // 4-char shorthand (#RGB)
  if (trimmed.startsWith('#') && trimmed.length === 4 && /^#[0-9a-fA-F]{3}$/.test(trimmed)) {
    const r = trimmed[1], g = trimmed[2], b = trimmed[3];
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }
  // 6-char hex without #
  if (/^[0-9a-fA-F]{6}$/.test(trimmed)) return `#${trimmed}`.toUpperCase();
  // 3-char hex without #
  if (/^[0-9a-fA-F]{3}$/.test(trimmed)) {
    const r = trimmed[0], g = trimmed[1], b = trimmed[2];
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }
  return null;
};

// Extract all <style> tag contents from HTML
const extractStyleTags = (html: string): string => {
  const styleMatches = html.match(/<style\b[^>]*>([\s\S]*?)<\/style>/gi) || [];
  return styleMatches.join('\n');
};

// Extract CSS custom properties (variables) from style content
const extractCssVariables = (css: string): string => {
  const lines = css.split('\n');
  const varLines = lines.filter(line => line.includes('--') && line.includes(':'));
  return varLines.slice(0, 200).join('\n'); // limit to 200 lines
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

    // Pre-extract CSS: style tags + CSS variables (highest priority for AI)
    const styleTagContent = extractStyleTags(html);
    const cssVariables = extractCssVariables(styleTagContent);

    // Clean HTML body: remove scripts and comments, keep style content
    const cleanedHtml = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '')
      .substring(0, 60000); // reduced to leave room for CSS context

    console.log('Style tags length:', styleTagContent.length, '| CSS vars length:', cssVariables.length);

    const systemPrompt = `Je bent een expert in webdesign en CSS-analyse. Je taak is om de exacte merkidentiteitskleuren van een website te extraheren uit de HTML/CSS broncode.

ANALYSEVOLGORDE (van meest naar minst betrouwbaar):
1. EERST: zoek CSS-variabelen in <style> tags — dit zijn de meest betrouwbare bronnen (--primary, --background, --color-*, --text-*, --card-*, etc.)
2. DAN: zoek inline styles op herkenbare elementen (style="background-color: ...", style="color: ...")
3. DAN: zoek Tailwind/Bootstrap utility klassen op bekende elementen (bg-blue-600, text-gray-500, etc.)
4. LAATSTE RESORT: visuele inschatting op basis van kleurpatronen in de HTML

KRITIEKE REGELS:
1. Gebruik ALLEEN kleuren van vaste UI-elementen: achtergronden, tekst, knoppen, navigatie, headers, footers, kaarten
2. Gebruik NOOIT kleuren van <img>, <picture>, src-attributen, of decoratieve SVG-fills
3. Knoppen hebben bijna altijd WITTE tekst (#FFFFFF) — gebruik dit als standaard voor cta_tekst_kleur tenzij de knoptekst duidelijk donker is
4. Geef altijd geldige 6-karakter hex-kleuren terug (#RRGGBB formaat, bijv. #1A2B3C)
5. Gebruik NOOIT 3-karakter hex (#RGB) — altijd uitschrijven naar 6 karakters

SPECIALE INSTRUCTIES PER VELD:

achtergrond_kleur:
- Dit is de background-color van <body>, <html>, of de buitenste wrapper <div>
- Zoek specifiek naar: body { background-color: ... }, html { background: ... }, .wrapper, .container, #app, #root
- CSS-variabelen: --background, --bg-color, --body-bg, --page-bg, --surface
- Dit is de kleur die je ziet op de lege pagina vóór enige content

kaart_achtergrond:
- Dit is de achtergrond van herhalende content-blokken zoals .card, .block, .tile, article, .post, .item
- Zoek naar: .card { background: ... }, .block { background-color: ... }, section met eigen achtergrond
- CSS-variabelen: --card, --card-bg, --surface-2, --block-bg
- Als geen afwijkende kaartachtergrond bestaat, gebruik dezelfde kleur als achtergrond_kleur
- Mag dezelfde kleur zijn als achtergrond_kleur — verzin GEEN andere kleur als die er niet is

secundaire_kleur:
- Dit is een duidelijk aanwezige tweede merkkleur naast de primaire kleur
- Zoek naar: secondary buttons, hover states, highlights, tweede kleur in het logo of navigatie
- CSS-variabelen: --secondary, --color-secondary, --accent-secondary
- ALS GEEN duidelijke secundaire kleur aanwezig is: gebruik dezelfde kleur als primaire_kleur of een donkere/lichte variant ervan
- NOOIT een willekeurige kleur verzinnen die niet in de broncode staat

subtekst_kleur:
- Dit is de kleur van ondersteunende tekst: subtitels, metadata, labels, beschrijvingen, captions
- Zoek naar: .subtitle, .meta, .caption, .description, p.secondary, span.muted, .text-muted, .helper-text
- CSS-variabelen: --text-secondary, --muted, --text-muted, --text-light, --foreground-muted, --color-text-secondary
- Als geen specifieke subtekstkleur bestaat: gebruik een lichter grijstint dan de hoofdtekstkleur (bijv. #6B7280 of #9CA3AF als de hoofdtekst donkergrijs is)
- NOOIT dezelfde kleur gebruiken als tekst_kleur tenzij er echt geen subtekst bestaat`;

    const userPrompt = `Analyseer de merkidentiteitskleuren van de website ${formattedUrl}.

== CSS-VARIABELEN (HOOGSTE PRIORITEIT) ==
${cssVariables || '(geen CSS-variabelen gevonden)'}

== ALLE STYLE TAGS ==
${styleTagContent.substring(0, 15000) || '(geen style tags gevonden)'}

== HTML BRONCODE ==
\`\`\`
${cleanedHtml}
\`\`\`

Gebruik de tool "extract_brand_colors" om de 10 merkidentiteitskleuren terug te geven. Analyseer EERST de CSS-variabelen en style tags hierboven.`;

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
              description: 'Extraheer de 10 merkidentiteitskleuren van de website. Analyseer CSS-variabelen en style tags als primaire bron.',
              parameters: {
                type: 'object',
                properties: {
                  primaire_kleur: {
                    type: 'string',
                    description: 'De primaire merkkleur — de meest dominante accentkleur, vaak de achtergrond van CTA-knoppen. Zoek naar: .btn-primary, .button, a.cta, --primary, --color-primary, --brand-color. (#RRGGBB formaat)',
                  },
                  secundaire_kleur: {
                    type: 'string',
                    description: 'De secundaire merkkleur — een tweede duidelijk aanwezige merkkleur. Zoek naar: --secondary, --color-secondary, secondary buttons, hover states. ALS NIET AANWEZIG: gebruik dezelfde kleur als primaire_kleur of een donkere variant. Verzin NOOIT een willekeurige kleur. (#RRGGBB formaat)',
                  },
                  achtergrond_kleur: {
                    type: 'string',
                    description: 'De achtergrondkleur van de gehele pagina. Zoek SPECIFIEK naar: body { background-color }, html { background }, #root, #app, .wrapper. CSS-vars: --background, --bg-color, --body-bg, --page-bg. Dit is de kleur van de lege pagina vóór enige content. (#RRGGBB formaat)',
                  },
                  kaart_achtergrond: {
                    type: 'string',
                    description: 'Achtergrondkleur van herhalende content-blokken. Zoek naar: .card { background }, .block, .tile, article, .post. CSS-vars: --card, --card-bg, --surface-2. Als geen aparte kaartachtergrond bestaat: gebruik dezelfde kleur als achtergrond_kleur. Verzin GEEN andere kleur als die niet in de broncode staat. (#RRGGBB formaat)',
                  },
                  tekst_kleur: {
                    type: 'string',
                    description: 'Primaire tekstkleur voor koppen (h1-h6) en bodytekst (p). Zoek naar: body { color }, p { color }, --foreground, --text-color, --color-text. (#RRGGBB formaat)',
                  },
                  subtekst_kleur: {
                    type: 'string',
                    description: 'Secundaire tekstkleur voor ondersteunende tekst. Zoek SPECIFIEK naar: .subtitle, .meta, .caption, .description, .muted, .helper. CSS-vars: --text-secondary, --muted, --text-muted, --text-light, --foreground-muted. Als niet aanwezig: gebruik een lichter grijstint dan tekst_kleur (bijv. #6B7280 of #9CA3AF). NOOIT dezelfde als tekst_kleur tenzij subtekst echt niet bestaat. (#RRGGBB formaat)',
                  },
                  accent_kleur: {
                    type: 'string',
                    description: 'Accentkleur voor links, highlights, actieve menu-items, borders. Zoek naar: a { color }, .active, .highlight, --accent, --link-color. Mag gelijk zijn aan primaire_kleur. (#RRGGBB formaat)',
                  },
                  cta_tekst_kleur: {
                    type: 'string',
                    description: 'Tekstkleur OP CTA-knoppen (niet de knopachtergrond). Standaard: #FFFFFF (wit). Alleen donker als de knopachtergrond licht is en de tekst duidelijk donker is. (#RRGGBB formaat)',
                  },
                  footer_achtergrond: {
                    type: 'string',
                    description: 'Achtergrondkleur van de footer-sectie. Zoek naar: footer { background-color }, .footer, #footer. CSS-vars: --footer-bg, --footer-background. (#RRGGBB formaat)',
                  },
                  footer_tekst_kleur: {
                    type: 'string',
                    description: 'Tekstkleur in de footer. Als footer donker is: gebruik #FFFFFF of lichtgrijs. Als footer licht is: gebruik donkere tekstkleur. Zoek naar: footer { color }, .footer p, .footer a. (#RRGGBB formaat)',
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
      subtekst_kleur: toHex(extractedColors.subtekst_kleur) || '#6B7280',
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
