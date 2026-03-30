

## Plan: AI auto-invullen bedrijfsvelden op Nieuwsbrief pagina

### Wat wordt gebouwd
Een "Auto invullen" knop naast de bedrijfsinstellingen die de website van het geselecteerde bedrijf afleest en via AI de tekstvelden automatisch invult (bedrijfsnaam, tagline, bedrijfsomschrijving, doelgroep, toon, CTA tekst, CTA URL).

### Aanpak

**1. Nieuwe Edge Function: `extract-company-info`**
- Hergebruikt het patroon van `extract-brand-colors` (HTML ophalen, AI analyseren)
- Haalt de website HTML op, stuurt deze naar Lovable AI (Gemini Flash) met tool calling
- Extraheert gestructureerd: bedrijfsnaam, tagline, bedrijfsomschrijving, doelgroep, toon, cta_tekst, cta_url
- De AI analyseert de homepage tekst, meta tags, hero sectie, about-sectie, en CTA's

**2. UI aanpassing in `src/pages/Nieuwsbrief.tsx`**
- Voegt een "AI invullen" knop toe (met Wand2 icoon) bij de Bedrijfsinstellingen card header
- Knop is alleen beschikbaar als er een website URL is ingevuld
- Bij klik: roept de edge function aan, vult alle tekstvelden in, slaat op naar database
- Loading state met spinner tijdens het ophalen

### Technische details

**Edge Function prompt strategie:**
- Systemprompt instrueert de AI om specifiek te zoeken naar: bedrijfsnaam (title tag, logo tekst), tagline (hero subtitle, meta description), bedrijfsomschrijving (about sectie, meta description), doelgroep (wie ze bedienen), toon (formeel/informeel analyse), CTA tekst en URL (buttons, call-to-actions)
- Tool calling met strict schema voor gevalideerde output
- Velden die niet gevonden worden blijven leeg (null)

**Bestanden:**
- Nieuw: `supabase/functions/extract-company-info/index.ts`
- Aangepast: `src/pages/Nieuwsbrief.tsx` (knop + handler)
- Aangepast: `supabase/config.toml` (function config)

