
## Plan: Beschrijving toevoegen bij Automatische Trigger

### Wat er moet gebeuren

Aan de `ScheduleTrigger` component een optionele `description` prop toevoegen. Wanneer deze prop is ingevuld, toont het component een kleine beschrijvingstekst direct onder de "Automatische Trigger" label.

### Wijzigingen

**`src/components/seo/ScheduleTrigger.tsx`**:
- Voeg `description?: string` toe aan `ScheduleTriggerProps`
- Render de beschrijving onder de label: `<p className="text-white/40 text-xs">{description}</p>`

**`src/pages/WordpressAltText.tsx`**:
- Geef `description="Deze trigger geldt voor alle bedrijven"` mee aan `<ScheduleTrigger>`

**`src/pages/Landingspagina.tsx`** (heeft ook een global trigger):
- Bekijken of die ook een beschrijving nodig heeft

### Bestanden

| Bestand | Aanpassing |
|---|---|
| `src/components/seo/ScheduleTrigger.tsx` | Voeg `description` prop toe + render |
| `src/pages/WordpressAltText.tsx` | Geef beschrijving mee aan component |
| `src/pages/Landingspagina.tsx` | Controleren of ook van toepassing |
