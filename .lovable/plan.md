

# Plan: Correcte Bedrijfs-Breakdown voor Bespaarde Uren

## Probleem Analyse

De huidige tooltip toont alle uren onder "Overig" in plaats van per bedrijf. Dit komt door een matching bug in de edge function:

### Huidige Data Structuur

| Bron | Workflow Namen | Company |
|------|----------------|---------|
| **automation_settings** | `SEO blog`, `SEO zoekwoorden` | "Overig" |
| **companies (Mediabirds)** | `MEDIABIRDS zoekwoorden`, `MEDIABIRDS seo` | Mediabirds |
| **companies (Tikt)** | `TIKT zoekwoorden`, `TIKT seo` | Tikt |

### De Bug
De n8n workflow `SEO blog` matcht met de automation_settings entry (`seo blog` → "Overig") **voordat** het kan matchen met de company entries (`mediabirds seo`, `tikt seo`).

De `includes()` check is te breed - `seo blog` bevat `seo`, dus het matcht met de eerste "Overig" entry.

---

## Oplossing

Verbeter de workflow-naar-bedrijf matching met een **prioriteitsysteem**:

1. **Exacte match eerst** - workflow naam moet exact overeenkomen
2. **Company-specifieke prefix match** - workflows die beginnen met bedrijfsnaam (MEDIABIRDS, TIKT)
3. **Fallback naar "Overig"** - alleen als geen company-specifieke match

### Nieuwe Matching Strategie

| n8n Workflow | Matched Entry | Bedrijf |
|--------------|---------------|---------|
| `MEDIABIRDS Alt-text Wordpress` | Exact match in automation_settings | Mediabirds (via prefix) |
| `MEDIABIRDS monday planning` | Exact match | Mediabirds (via prefix) |
| `SEO blog` | Geen company match → automation_settings | Overig |
| `TIKT zoekwoorden` | Exact match in companies | Tikt |

**Belangrijke inzicht:** De huidige database heeft `SEO blog` en `SEO zoekwoorden` als generieke workflows in automation_settings, terwijl de company-specifieke workflows andere namen hebben (`MEDIABIRDS seo`, `TIKT seo`).

---

## Technische Wijzigingen

### 1. Edge Function: `supabase/functions/get-saved-hours/index.ts`

Herschrijf de matching logica:

```text
Nieuwe aanpak:
1. Bouw een prioriteits-map met:
   - Exacte workflow namen → info
   - Company prefixes → info (MEDIABIRDS*, TIKT*)
   
2. Bij het matchen van een n8n workflow:
   a. Check exacte match in companies tabel entries
   b. Check exacte match in automation_settings entries
   c. Check of workflow naam begint met bedrijfsnaam
   d. Check of workflow naam BEVAT een bekende key
   e. Fallback naar "Overig"

3. Extracteer bedrijfsnaam uit workflow naam als prefix match:
   "MEDIABIRDS Alt-text Wordpress" → Bedrijf: "Mediabirds"
```

### Specifieke Code Wijzigingen

**Probleem 1: Automation settings krijgen "Overig" als company**

Oplossing: Extracteer bedrijfsnaam uit de workflow naam als deze een bedrijfsnaam bevat:
```typescript
// Als workflow naam begint met een bekende bedrijfsnaam, gebruik die
const companyPrefix = extractCompanyFromWorkflowName(workflowName, companies);
if (companyPrefix) {
  companyName = companyPrefix;
}
```

**Probleem 2: Matching volgorde is verkeerd**

Oplossing: Prioriteer exacte matches boven contains:
```typescript
// Stap 1: Check exacte match
if (workflowInfoMap[workflowNameLower]) {
  return workflowInfoMap[workflowNameLower];
}

// Stap 2: Check company prefix match
for (const company of companies) {
  if (workflowNameLower.startsWith(company.name.toLowerCase())) {
    // Bepaal workflow type en return info
  }
}

// Stap 3: Contains match (huidige logica)
```

---

## Verbeterde Tooltip UI

De huidige tooltip UI is al goed opgezet voor meerdere bedrijven. Na de backend fix zal deze correct werken:

```text
+--------------------------------------------+
│  BESPAARD DEZE MAAND                       │
│  Periode: 28 dec - 27 jan                  │
│                                            │
│  MEDIABIRDS                    │ 120.5 uur │
│  ████████████████████░░░░░░░░░ │   59%     │
│  • SEO Blog: 58 uur (116 runs)             │
│  • SEO Zoekwoorden: 50 uur (100 runs)      │
│  • Monday Planning: 3.75 uur (5 runs)      │
│  • Alt-text: 1.7 uur (34 runs)             │
│                                            │
│  TIKT                          │  83.5 uur │
│  ██████████████░░░░░░░░░░░░░░░ │   41%     │
│  • SEO Blog: 57.5 uur (115 runs)           │
│  • SEO Zoekwoorden: 26 uur (52 runs)       │
│                                            │
│  ─────────────────────────────             │
│  Totaal: 204 uur (436 executies)           │
+--------------------------------------------+
```

---

## Schaalbare Oplossing voor Meer Bedrijven

De tooltip is al ontworpen om te schalen:

| Eigenschap | Implementatie |
|------------|---------------|
| **Sortering** | Bedrijven gesorteerd op meeste uren (grootste eerst) |
| **Scroll** | Bij veel bedrijven wordt de tooltip scrollbaar |
| **Compacte weergave** | Voortgangsbalk per bedrijf geeft snel inzicht |
| **Details on-demand** | Workflow details zijn compact onder elk bedrijf |

### UI Verbeteringen voor Schaalbaarheid

1. **Max hoogte met scroll** - Voeg `max-h-[400px] overflow-y-auto` toe
2. **Collapsible sections** - Optioneel: workflow details inklapbaar maken
3. **Top N bedrijven** - Bij >5 bedrijven, toon top 5 met "en X anderen"

---

## Bestanden Overzicht

| Bestand | Wijziging |
|---------|-----------|
| `supabase/functions/get-saved-hours/index.ts` | Verbeterde matching logica met bedrijfsnaam extractie |
| `src/components/dashboard/SavedHoursInfoTooltip.tsx` | Max hoogte + scroll voor schaalbaarheid |

---

## Verwacht Resultaat

Na implementatie:
- Workflows met bedrijfsnaam in de naam worden correct gekoppeld aan dat bedrijf
- Generieke workflows (zonder bedrijfsnaam) blijven onder "Overig"
- Tooltip toont per bedrijf hoeveel uur bespaard is
- Schaalbaar naar meer bedrijven met scrollbare weergave

