

## Invulvelden Landingspagina gelijktrekken met "Doel/kern" van SEO-pagina

### Wat verandert er

Alle bewerkbare velden op de Landingspagina krijgen exact hetzelfde drie-stappen interactiepatroon als het "Doel/kern" veld op de SEO-pagina:

1. **Dichtgeklapt**: Klikbaar vlak met tekst of cursieve "Niet ingesteld"
2. **Uitgeklapt**: Toont volledige tekst + potlood-icoon rechts
3. **Bewerken**: Textarea (in plaats van Input) die automatisch meeschaalt met de inhoud

**Uitzondering**: Het wachtwoordveld behoudt `type="password"` gedrag (toont stippen), maar krijgt wel dezelfde drie-stappen flow.

### Technische aanpassingen

**Bestand: `src/pages/Landingspagina.tsx`**

1. **Import Textarea** toevoegen naast Input
2. **`renderEditableField` herschrijven** zodat het exact de `renderTextField` logica uit `KeywordResearchForm.tsx` volgt:
   - Collapsed: `bg-white/5 border-white/10` styling, cursieve "Niet ingesteld" als placeholder
   - Expanded: `whitespace-pre-wrap min-h-[40px]` met Pencil-knop
   - Editing: `Textarea` met `min-h-[80px] resize-none` en auto-resize via `ref` en `onChange`
3. **Wachtwoordveld apart afhandelen**: Gebruikt hetzelfde drie-stappen patroon maar toont stippen in collapsed/expanded modus en een `<Input type="password">` in edit-modus (geen Textarea voor wachtwoorden)
4. **Styling uniforme kleuren**: `border-white/10` in plaats van `border-white/20` voor consistentie met SEO-pagina

