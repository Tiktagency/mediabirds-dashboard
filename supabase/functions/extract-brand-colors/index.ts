const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Parse hex color to RGB
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    return {
      r: parseInt(clean[0] + clean[0], 16),
      g: parseInt(clean[1] + clean[1], 16),
      b: parseInt(clean[2] + clean[2], 16),
    };
  }
  if (clean.length === 6) {
    return {
      r: parseInt(clean.slice(0, 2), 16),
      g: parseInt(clean.slice(2, 4), 16),
      b: parseInt(clean.slice(4, 6), 16),
    };
  }
  return null;
};

// Returns true if color is dark (luminance < 0.35)
const isDark = (hex: string): boolean => {
  const rgb = hexToRgb(hex);
  if (!rgb) return true;
  // Relative luminance (WCAG)
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance < 0.35;
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

    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl connector niet geconfigureerd' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let formattedUrl = website.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    console.log('Extracting brand colors from:', formattedUrl);

    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: formattedUrl,
        formats: ['branding'],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Firecrawl API error:', data);
      return new Response(
        JSON.stringify({ success: false, error: data.error || `Firecrawl fout: ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const branding = data.branding || data.data?.branding;
    if (!branding) {
      return new Response(
        JSON.stringify({ success: false, error: 'Geen branding data gevonden voor deze website' }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log raw branding for debugging
    console.log('Raw branding response:', JSON.stringify(branding, null, 2));

    const colors = branding.colors || {};
    const components = branding.components || {};
    const buttonPrimary = components.buttonPrimary || {};

    // Resolve each color with priority chain — never use arbitrary hardcoded values
    const primary = toHex(buttonPrimary.background) || toHex(colors.primary);
    const secondary = toHex(colors.secondary); // only use if explicitly provided
    const background = toHex(colors.background);
    const textPrimary = toHex(colors.textPrimary);
    const textSecondary = toHex(colors.textSecondary);
    const accent = toHex(colors.accent) || primary;
    const ctaTextColor = toHex(buttonPrimary.textColor) || '#FFFFFF';

    // footer_achtergrond: secondary if available, otherwise primary
    const footerBg = secondary || primary;

    // footer_tekst_kleur: white on dark background, primary text on light background
    const footerTextColor = footerBg && isDark(footerBg)
      ? '#FFFFFF'
      : (textPrimary || '#1A1A1A');

    // kaart_achtergrond: use background (cards are usually same or slightly lighter)
    const cardBg = background;

    const mappedColors = {
      primaire_kleur: primary || '#000000',
      secundaire_kleur: secondary || primary || '#000000',
      achtergrond_kleur: background || '#FFFFFF',
      kaart_achtergrond: cardBg || '#FFFFFF',
      tekst_kleur: textPrimary || '#1A1A1A',
      subtekst_kleur: textSecondary || textPrimary || '#6B7280',
      accent_kleur: accent || primary || '#000000',
      cta_tekst_kleur: ctaTextColor,
      footer_achtergrond: footerBg || primary || '#000000',
      footer_tekst_kleur: footerTextColor,
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
