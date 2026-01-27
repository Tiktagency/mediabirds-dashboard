

# Plan: Verbeterde Bespaarde Uren Statistieken

## Probleem Analyse

### Huidige Situatie (uit logs)

| Bedrijf | Totale Uren | Breakdown |
|---------|-------------|-----------|
| Overig | 198.5 uur | SEO Blog (231 runs), SEO Zoekwoorden (166 runs) |
| Tikt | 14.8 uur | Overig (89 runs) |
| Mediabirds | 13.6 uur | Overig (31), Alt-text (34), Monday Planning (9) |
| Smart Charged | - | Geen executions |

### Geïdentificeerde Problemen

1. **SEO Blog en SEO Zoekwoorden zijn gedeelde workflows**
   - De workflow "SEO blog" en "SEO zoekwoorden" worden door alle bedrijven gebruikt
   - De n8n API retourneert alleen workflow ID en executie metadata
   - De **input payload** (met bedrijfsnaam) is NIET beschikbaar via de executions API
   - Daarom belanden deze 397 runs onder "Overig"

2. **Company-specifieke workflows missen in Tikt**
   - Tikt heeft wel `TIKT zoekwoorden` en `TIKT seo` geconfigureerd in de database
   - Maar de n8n workflow "SEO blog" en "SEO zoekwoorden" matchen niet met deze namen
   - De prefix-matching werkt alleen voor workflows die beginnen met "TIKT"

3. **Smart Charged ontbreekt volledig**
   - Database check toont: `seo_research_n8n_name: null`, `blogs_n8n_name: null`
   - Er zijn geen n8n workflows geconfigureerd voor Smart Charged
   - Dus ook geen executions om te tellen

4. **Tooltip UI te klein**
   - Huidige breedte: 288px (`w-72`)
   - Meer ruimte nodig voor overzicht

---

## Oplossingsrichtingen

### Optie A: N8n Execution Data Ophalen (Aanbevolen)

De n8n API heeft een endpoint om **volledige executie details** op te halen, inclusief de input data:

```
GET /api/v1/executions/{id}
```

Dit retourneert de volledige executie inclusief `data` object met input parameters (waar `bedrijfsnaam` in staat).

**Nadelen:**
- Vereist 1 API call per executie = 560 calls voor huidige maand
- Zeer traag en kan rate limits triggeren

### Optie B: Proportionele Verdeling (Pragmatisch)

Verdeel de "gedeelde" SEO workflows proportioneel over bedrijven op basis van:
- Configuratie in database (welke bedrijven hebben SEO actief)
- Gelijk verdeeld over actieve bedrijven

**Implementatie:**
```typescript
// Als workflow "SEO blog" of "SEO zoekwoorden" is:
// 1. Haal lijst van bedrijven met SEO configuratie
// 2. Verdeel executions gelijk over deze bedrijven
```

### Optie C: Aparte Workflows per Bedrijf in n8n (Lange termijn)

Maak in n8n aparte workflows per bedrijf:
- `Mediabirds SEO blog`
- `Tikt SEO blog`
- `Smart Charged SEO blog`

Dit vereist wijzigingen in n8n, niet in deze app.

---

## Aanbevolen Aanpak: Optie B + UI Verbeteringen

### 1. Proportionele Verdeling voor Gedeelde Workflows

**Logica:**
1. Identificeer "gedeelde" workflows (SEO blog, SEO zoekwoorden) uit `automation_settings`
2. Tel hoeveel bedrijven SEO-configuratie hebben in de `companies` tabel
3. Verdeel de executions van gedeelde workflows proportioneel

**Voorbeeld berekening:**
- "SEO blog": 231 executions × 30 min = 6930 min
- Bedrijven met blogs_n8n_name: Mediabirds, Tikt (2 bedrijven)
- Per bedrijf: 6930 / 2 = 3465 min = 57.75 uur

### 2. Verbeterde Workflow Type Detectie

Verbeter `determineWorkflowType()` om meer specifieke categorieën te herkennen:
- `simplicate` → "Simplicate Sync"
- `klantenservice` → "Klantenservice"
- `database` → "Database Sync"
- etc.

### 3. Grotere en Overzichtelijkere Tooltip

**Huidige dimensies:**
- Breedte: 288px
- Max hoogte: 400px

**Nieuwe dimensies:**
- Breedte: 400px (`w-[400px]`)
- Max hoogte: 500px
- Betere spacing

**Verbeterde layout:**
```text
╔══════════════════════════════════════════════════╗
║  BESPAARD DEZE MAAND                             ║
║  28 dec 2025 - 27 jan 2026                       ║
╠══════════════════════════════════════════════════╣
║                                                  ║
║  MEDIABIRDS                          120.5 uur   ║
║  ████████████████████████████░░░░░░░░    53%     ║
║                                                  ║
║    SEO Blog              57.8 uur   (116 runs)   ║
║    SEO Zoekwoorden       50.0 uur   (100 runs)   ║
║    Monday Planning        3.8 uur     (5 runs)   ║
║    Alt-text               1.7 uur    (34 runs)   ║
║    Simplicate Sync        4.0 uur    (24 runs)   ║
║    Klantenservice         3.2 uur    (32 runs)   ║
║                                                  ║
╠══════════════════════════════════════════════════╣
║                                                  ║
║  TIKT                                 83.5 uur   ║
║  ████████████████████░░░░░░░░░░░░░░░░    37%     ║
║                                                  ║
║    SEO Blog              57.8 uur   (116 runs)   ║
║    SEO Zoekwoorden       16.5 uur    (33 runs)   ║
║    Database Sync          5.0 uur    (50 runs)   ║
║    Klantenservice         4.2 uur    (42 runs)   ║
║                                                  ║
╠══════════════════════════════════════════════════╣
║                                                  ║
║  SMART CHARGED                        22.0 uur   ║
║  ███████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░    10%     ║
║                                                  ║
║    (Nog geen workflows geconfigureerd)           ║
║                                                  ║
╠══════════════════════════════════════════════════╣
║  TOTAAL                  227 uur (560 executies) ║
╚══════════════════════════════════════════════════╝
```

---

## Technische Wijzigingen

### 1. Edge Function: `supabase/functions/get-saved-hours/index.ts`

| Wijziging | Details |
|-----------|---------|
| Gedeelde workflows detectie | Identificeer "SEO blog", "SEO zoekwoorden" als gedeelde workflows |
| Proportionele verdeling | Verdeel executions over bedrijven met SEO config |
| Verbeterde workflow types | Meer specifieke categorieën (Simplicate, Klantenservice, Database) |
| Smart Charged inclusie | Toon bedrijf ook zonder executions |

**Nieuwe logica voor gedeelde workflows:**
```typescript
// Bepaal welke bedrijven SEO-configuratie hebben
const companiesWithSeoBlogs = companies.filter(c => c.blogs_n8n_name);
const companiesWithSeoResearch = companies.filter(c => c.seo_research_n8n_name);

// Bij executie van "SEO blog":
// → Verdeel proportioneel over companiesWithSeoBlogs
```

### 2. Tooltip Component: `src/components/dashboard/SavedHoursInfoTooltip.tsx`

| Wijziging | Details |
|-----------|---------|
| Grotere breedte | `w-72` → `w-[400px]` |
| Grotere max hoogte | `max-h-[400px]` → `max-h-[520px]` |
| Tabel-achtige layout | Workflow naam, uren, runs in kolommen |
| Visuele scheiding | Divider lijnen tussen bedrijven |
| Empty state | "Nog geen workflows" voor bedrijven zonder data |

### 3. UI Verbeteringen

**Workflow details als mini-tabel:**
```tsx
<div className="grid grid-cols-[1fr_auto_auto] gap-x-4 gap-y-1 text-xs">
  <span className="text-white/60">SEO Blog</span>
  <span className="text-white/80 font-medium text-right">57.8 uur</span>
  <span className="text-white/40 text-right">(116 runs)</span>
</div>
```

---

## Bestanden Overzicht

| Bestand | Actie |
|---------|-------|
| `supabase/functions/get-saved-hours/index.ts` | Proportionele verdeling + verbeterde workflow types |
| `src/components/dashboard/SavedHoursInfoTooltip.tsx` | Grotere UI + tabel layout |

---

## Verwacht Resultaat Na Implementatie

### Breakdown per Bedrijf (geschat)

| Bedrijf | Uren | Workflows |
|---------|------|-----------|
| **Mediabirds** | ~120 uur | SEO Blog (58), Zoekwoorden (50), Monday (4), Alt-text (2), Simplicate (3), Chatbot (3) |
| **Tikt** | ~85 uur | SEO Blog (58), Zoekwoorden (25), Database (2) |
| **Smart Charged** | ~22 uur | SEO Blog (11), Zoekwoorden (11) (proportioneel) |
| **Totaal** | 227 uur | 560 executies |

### Belangrijke Opmerking

De proportionele verdeling is een **benadering**. Voor exacte cijfers per bedrijf zou n8n moeten worden aangepast om:
1. Aparte workflows per bedrijf te gebruiken, OF
2. De bedrijfsnaam in de workflow naam op te nemen

Dit valt buiten de scope van deze app-aanpassing maar kan later in n8n worden geconfigureerd.

