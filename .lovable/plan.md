
## Alle velden verplicht + layout omhoog schuiven

### Wijzigingen

**1. Pagina url ook verplicht maken voor de Start-knop (regel 287)**

Voeg `!editPageUrl.trim()` toe aan de `disabled` conditie van de Start-knop.

**2. Validatie in handleStart bijwerken (regel 82)**

Voeg `editPageUrl` toe aan de check zodat ook een toast verschijnt als het veld leeg is.

**3. Layout omhoog schuiven -- geen scroll nodig**

- **Regel 179**: `pt-32` verkleinen naar `pt-20` (minder ruimte boven de titel)
- **Regel 181**: `mb-6` verkleinen naar `mb-3` (minder ruimte onder de beschrijving)
- **Regel 186**: `mb-6` verkleinen naar `mb-3` (minder ruimte onder de ScheduleTrigger)
- **Regel 202**: `p-6` verkleinen naar `p-4` en `space-y-4` naar `space-y-3` (compactere card)
- **Regel 199**: `gap-6` verkleinen naar `gap-4` (minder ruimte tussen kolommen)

### Technische details

| Bestand | Regel | Wijziging |
|---|---|---|
| `src/pages/Landingspagina.tsx` | 82 | `editPageUrl.trim()` toevoegen aan validatie |
| `src/pages/Landingspagina.tsx` | 287 | `!editPageUrl.trim()` toevoegen aan `disabled` |
| `src/pages/Landingspagina.tsx` | 179 | `pt-32` → `pt-20` |
| `src/pages/Landingspagina.tsx` | 181 | `mb-6` → `mb-3` |
| `src/pages/Landingspagina.tsx` | 186 | `mb-6` → `mb-3` |
| `src/pages/Landingspagina.tsx` | 199 | `gap-6` → `gap-4` |
| `src/pages/Landingspagina.tsx` | 202 | `p-6 space-y-4` → `p-4 space-y-3` |
