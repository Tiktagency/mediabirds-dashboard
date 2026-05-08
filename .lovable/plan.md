

# Plan: Info Tooltip voor Bespaard Deze Maand Tile

## Huidige Situatie

### Data Actualiteit
De bespaarde uren worden **live berekend** bij elke pageload door de `get-saved-hours` edge function:
- Haalt alle executies van de afgelopen 30 dagen op via de n8n API
- Gebruikt cursor-based pagination om ALLE executies te tellen
- Cachet resultaat lokaal voor 1 uur (voor snellere weergave)
- Berekening is dus altijd actueel en update bij elke bezoek aan het dashboard

### Huidige Breakdown
De edge function retourneert al een breakdown, maar per workflow naam, niet per bedrijf:
```
SEO blog: 231 executies × 30 min = 115.5 uur
SEO zoekwoorden: 166 executies × 30 min = 83 uur
MEDIABIRDS monday planning: 5 × 45 min = 3.75 uur
MEDIABIRDS Alt-text Wordpress: 34 × 3 min = 1.7 uur
```

---

## Oplossing: Info Tooltip met Bedrijfsoverzicht

Voeg een info icoon toe aan de "Bespaard deze maand" tile met een uitgebreide tooltip die:
1. **Periode** toont (afgelopen 30 dagen)
2. **Breakdown per bedrijf** met uren en executies
3. **Breakdown per workflow type** binnen elk bedrijf
4. **Visuele voortgangsbalkjes** per bedrijf

---

## Tooltip Ontwerp

```text
+--------------------------------------------+
|  BESPAARD DEZE MAAND                       |
|  Periode: Afgelopen 30 dagen               |
|                                            |
|  MEDIABIRDS                    │ 120.5 uur |
|  ████████████████████░░░░░░░░░ │ 59%       |
|  • SEO Blog: 115 uur (180 runs)            |
|  • Monday Planning: 3.75 uur (5 runs)      |
|  • Alt-text: 1.75 uur (34 runs)            |
|                                            |
|  TIKT                          │  83.5 uur |
|  ██████████████░░░░░░░░░░░░░░░ │ 41%       |
|  • SEO Blog: 50 uur (100 runs)             |
|  • Zoekwoorden: 33.5 uur (66 runs)         |
|                                            |
|  ─────────────────────────────             |
|  Totaal: 204 uur (436 executies)           |
+--------------------------------------------+
```

---

## Technische Wijzigingen

### 1. Edge Function: `supabase/functions/get-saved-hours/index.ts`

Uitbreiden van de response om breakdown per bedrijf te retourneren:

| Aanpassing | Details |
|------------|---------|
| Workflow-naar-bedrijf mapping | Bij het verwerken van executies, koppel elke workflow aan het juiste bedrijf |
| Breakdown structuur | Retourneer `breakdownByCompany` naast `breakdown` |
| Extra metadata | Include periode start/eind datums |

Nieuwe response structuur:
```json
{
  "totalHours": 204,
  "totalMinutes": 12237,
  "executionCount": 436,
  "periodStart": "2025-12-28T00:00:00Z",
  "periodEnd": "2026-01-27T00:00:00Z",
  "breakdownByCompany": {
    "Mediabirds": {
      "totalMinutes": 7257,
      "totalHours": 120.95,
      "workflows": {
        "SEO blog": { "executions": 130, "minutesSaved": 3900 },
        "SEO zoekwoorden": { "executions": 100, "minutesSaved": 3000 },
        "monday planning": { "executions": 5, "minutesSaved": 225 },
        "Alt-text Wordpress": { "executions": 34, "minutesSaved": 102 }
      }
    },
    "Tikt": {
      "totalMinutes": 4980,
      "totalHours": 83,
      "workflows": {
        "SEO blog": { "executions": 101, "minutesSaved": 3030 },
        "SEO zoekwoorden": { "executions": 66, "minutesSaved": 1980 }
      }
    }
  }
}
```

### 2. Hook: `src/hooks/useSavedHours.ts`

Uitbreiden om extra data te retourneren:

| Aanpassing | Details |
|------------|---------|
| Nieuwe state | `breakdownByCompany`, `periodStart`, `periodEnd`, `executionCount` |
| Cache uitbreiden | Volledige response cachen inclusief breakdown |
| Types | TypeScript interfaces voor breakdown structuur |

### 3. Component: `src/components/dashboard/SavedHoursInfoTooltip.tsx`

Nieuw component voor de tooltip met bedrijfsoverzicht:

| Element | Beschrijving |
|---------|-------------|
| Header | "Bespaard deze maand" + periode |
| Per bedrijf | Naam, totaal uren, voortgangsbalk (% van totaal) |
| Workflow details | Lijst met uren en aantal executies |
| Footer | Totaal uren en executies |
| Styling | Consistent met `AutomationInfoTooltip` (dark theme, rounded) |

### 4. Component: `src/components/dashboard/SavedHoursTile.tsx`

Info icoon toevoegen met hover tooltip:

| Aanpassing | Details |
|------------|---------|
| Import | Nieuwe `SavedHoursInfoTooltip` component |
| Layout | Relatieve positionering voor info icoon rechtsbovenin |
| Data | Doorgeven van breakdown data aan tooltip |

---

## Visuele Details Tooltip

### Voortgangsbalk per Bedrijf
- Horizontale balk die percentage van totaal toont
- Kleur: primaire tile tekstkleur (met opacity variaties)
- Breedte: 100% = bedrijf met meeste uren

### Workflow Details
- Compacte lijst met bullet points
- Format: `{workflow naam}: {uren} uur ({aantal} runs)`
- Kleinere tekst dan bedrijfsnaam

### Styling Consistent met Bestaande Tooltips
- Donkere achtergrond (`bg-[#151515]`)
- Afgeronde hoeken (`rounded-2xl`)
- Subtiele schaduw
- Fade-in animatie
- Breedte: 280px (iets breder voor overzichtelijkheid)

---

## Bestanden Overzicht

| Bestand | Actie |
|---------|-------|
| `supabase/functions/get-saved-hours/index.ts` | Uitbreiden met bedrijfs-breakdown |
| `src/hooks/useSavedHours.ts` | Uitbreiden met breakdown data |
| `src/components/dashboard/SavedHoursInfoTooltip.tsx` | Nieuw component |
| `src/components/dashboard/SavedHoursTile.tsx` | Info icoon toevoegen |

