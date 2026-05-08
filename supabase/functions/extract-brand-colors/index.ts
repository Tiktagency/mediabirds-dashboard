const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
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

    const colors = branding.colors || {};

    // Helper to ensure valid hex color, fallback provided
    const hex = (val: string | undefined, fallback: string) => {
      if (!val) return fallback;
      const trimmed = val.trim();
      if (trimmed.startsWith('#') && (trimmed.length === 4 || trimmed.length === 7)) return trimmed;
      if (/^[0-9a-fA-F]{6}$/.test(trimmed)) return `#${trimmed}`;
      return fallback;
    };

    const mappedColors = {
      primaire_kleur: hex(colors.primary, '#000000'),
      secundaire_kleur: hex(colors.secondary, '#1A2B5E'),
      achtergrond_kleur: hex(colors.background, '#FFFFFF'),
      kaart_achtergrond: hex(colors.background || colors.surface, '#FFFFFF'),
      tekst_kleur: hex(colors.textPrimary, '#1A1A2E'),
      subtekst_kleur: hex(colors.textSecondary, '#6B7280'),
      accent_kleur: hex(colors.accent || colors.primary, '#4f46e5'),
      cta_tekst_kleur: hex(colors.textPrimary ? '#FFFFFF' : colors.textPrimary, '#FFFFFF'),
      footer_achtergrond: hex(colors.secondary || colors.primary, '#1A2B5E'),
      footer_tekst_kleur: hex(colors.textSecondary || '#E8EDF7', '#E8EDF7'),
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
