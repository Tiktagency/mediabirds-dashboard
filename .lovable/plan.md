
## Plan: Kleurenmodus — Custom vs. Automatisch genereren

### Wat er gebouwd wordt

In de "Huisstijl kleuren" sectie komen twee tabs/toggle-knoppen:
- **Custom** — huidige werking, handmatig alle kleuren bewerken
- **Automatisch genereren** — knop die de website URL gebruikt, via een nieuwe edge function Firecrawl aanroept (branding-format), en de 10 kleuren automatisch invult + opslaat

### Nieuwe edge function: `extract-brand-colors`

Maakt gebruik van de Firecrawl API (branding format) om kleuren van een website te halen. Firecrawl is **beschikbaar als connector** — dit moet eerst worden ingeschakeld.

De function:
1. Ontvangt een `website` URL
2. Roept Firecrawl aan met `formats: ['branding']`
3. Mapt de teruggegeven kleuren naar de 10 velden:
   - `primary` → `primaire_kleur`
   - `secondary` → `secundaire_kleur`  
   - `background` → `achtergrond_kleur`
   - `background` (licht variant) → `kaart_achtergrond`
   - `textPrimary` → `tekst_kleur`
   - `textSecondary` → `subtekst_kleur`
   - `accent` → `accent_kleur`
   - `background` (wit) → `cta_tekst_kleur`
   - `secondary` (donker) → `footer_achtergrond`
   - `textSecondary` (licht) → `footer_tekst_kleur`
4. Slaat de kleuren op in `newsletter_companies` als er een bedrijf geselecteerd is

### UI wijzigingen in `Nieuwsbrief.tsx`

Boven de kleurenvelden: twee knoppen als toggle (vergelijkbaar met tabs):

```
[Custom]  [Automatisch genereren]
```

Bij **Custom**: huidige ColorField grid zichtbaar, bewerkbaar.

Bij **Automatisch genereren**: 
- Kleuren worden grijs weergegeven (read-only, dezelfde ColorField maar disabled)
- Knop "Kleuren ophalen van website" met `Loader2` tijdens laden
- Waarschuwing als `website` veld leeg is

### Bestanden

| Bestand | Aanpassing |
|---|---|
| `supabase/functions/extract-brand-colors/index.ts` | Nieuwe edge function |
| `supabase/config.toml` | Entry toevoegen voor `extract-brand-colors` |
| `src/pages/Nieuwsbrief.tsx` | UI toggle + logica voor automatisch genereren |

### Firecrawl connector

Vereist dat Firecrawl als connector is ingeschakeld (connector_id: `firecrawl`). De `FIRECRAWL_API_KEY` wordt automatisch beschikbaar als secret in edge functions zodra de connector gelinkt is.
