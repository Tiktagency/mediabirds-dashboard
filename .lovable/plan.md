
# Plan: Accurate Bespaarde Uren per Bedrijf

## Probleemanalyse

Het huidige systeem kan niet bepalen welk bedrijf een SEO Blog of Zoekwoord execution heeft getriggerd omdat:
1. De n8n API alleen workflow ID retourneert, niet de payload
2. De `bedrijfsnaam` wordt wel naar n8n gestuurd maar nergens opgeslagen
3. Daarom worden executions proportioneel verdeeld - dit is een **schatting**, geen echte data

## Oplossing: Trigger Logging

### 1. Nieuwe Database Tabel: `workflow_executions`

| Kolom | Type | Beschrijving |
|-------|------|--------------|
| id | uuid | Primary key |
| company_id | uuid | FK naar companies |
| workflow_type | text | 'seo_blog' of 'seo_research' |
| triggered_at | timestamptz | Moment van trigger |
| triggered_by | uuid | User ID (nullable) |
| success | boolean | Of de webhook succesvol was |

### 2. Edge Functions Aanpassen

**`trigger-blog-generation/index.ts`**:
- Na succesvolle webhook call: insert record met company_id en workflow_type = 'seo_blog'
- Company ID ophalen via bedrijfsnaam uit de payload

**`trigger-seo-webhook/index.ts`**:
- Na succesvolle webhook call: insert record met company_id en workflow_type = 'seo_research'
- Company ID ophalen via bedrijfsnaam uit de formData

**`run-scheduled-blogs/index.ts`** en **`run-scheduled-seo/index.ts`**:
- Dezelfde logging voor scheduled triggers

### 3. Get-Saved-Hours Aanpassen

De edge function `get-saved-hours` wordt aangepast om:
1. **Eerst** de `workflow_executions` tabel te raadplegen voor accurate per-bedrijf counts
2. **Fallback** naar n8n API voor andere workflows (Alt-text, Monday Planning, etc.)
3. "Overig" automatiseringen toewijzen aan Mediabirds

## Dataflow Diagram

```text
┌─────────────────────────────────────────────────────────────────┐
│                        SEO Blog Pagina                          │
│                                                                 │
│   ┌─────────────────┐      ┌─────────────────────────────────┐ │
│   │ CompanySelector │ ──── │ Geselecteerd: "Smart Charged"   │ │
│   └─────────────────┘      └─────────────────────────────────┘ │
│                                       │                         │
│                                       ▼                         │
│   ┌───────────────────────────────────────────────────────────┐│
│   │ BlogGenerationForm.handleSubmit()                         ││
│   │ payload = { bedrijfsnaam: "Smart Charged", ... }          ││
│   └───────────────────────────────────────────────────────────┘│
└───────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌───────────────────────────────────────────────────────────────┐
│                  Edge Function: trigger-blog-generation        │
│                                                                │
│   1. Ontvang payload met bedrijfsnaam                          │
│   2. Call n8n webhook                                          │
│   3. Bij succes:                                               │
│      ┌─────────────────────────────────────────────────────┐  │
│      │ INSERT INTO workflow_executions                      │  │
│      │   (company_id, workflow_type, triggered_at, success) │  │
│      │ VALUES (uuid, 'seo_blog', now(), true)               │  │
│      └─────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌───────────────────────────────────────────────────────────────┐
│                  Edge Function: get-saved-hours                │
│                                                                │
│   1. Query workflow_executions voor exacte counts per bedrijf  │
│   2. Query n8n API voor overige workflows (Alt-text, Monday)   │
│   3. Wijs "Overig" toe aan Mediabirds                          │
│   4. Return breakdown per bedrijf                              │
└───────────────────────────────────────────────────────────────┘
```

## Technische Implementatie

### Stap 1: Database Migratie

Nieuwe tabel `workflow_executions` met RLS policies:
- Admins kunnen alles zien
- Service role kan inserts doen (edge functions)

### Stap 2: Edge Function Updates

**trigger-blog-generation/index.ts**:
```typescript
// Na succesvolle webhook response
const bedrijfsnaam = blogData?.bedrijfsnaam;
if (bedrijfsnaam) {
  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .eq('name', bedrijfsnaam)
    .single();
    
  if (company) {
    await supabase.from('workflow_executions').insert({
      company_id: company.id,
      workflow_type: 'seo_blog',
      triggered_by: userId,
      success: true,
    });
  }
}
```

**trigger-seo-webhook/index.ts**:
```typescript
// Na succesvolle webhook response
const bedrijfsnaam = formData?.bedrijfsnaam;
if (bedrijfsnaam) {
  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .eq('name', bedrijfsnaam)
    .single();
    
  if (company) {
    await supabase.from('workflow_executions').insert({
      company_id: company.id,
      workflow_type: 'seo_research',
      triggered_by: userId,
      success: true,
    });
  }
}
```

### Stap 3: Get-Saved-Hours Herschrijven

```typescript
// Haal exacte counts uit workflow_executions (voor afgelopen 30 dagen)
const { data: executions } = await supabase
  .from('workflow_executions')
  .select('company_id, workflow_type, success')
  .gte('triggered_at', periodStart.toISOString())
  .eq('success', true);

// Tel per bedrijf
const countsByCompany: Record<string, { seo_blog: number; seo_research: number }> = {};
for (const exec of executions) {
  // ... aggregeer per company_id
}

// Voeg toe aan breakdownByCompany met juiste uren
```

### Stap 4: "Overig" naar Mediabirds

```typescript
// Alle workflows die niet aan een specifiek bedrijf zijn gekoppeld
// gaan naar Mediabirds
if (companyName === 'Overig') {
  companyName = 'Mediabirds';
}
```

## Bestanden die Aangepast Worden

| Bestand | Wijziging |
|---------|-----------|
| `supabase/migrations/xxx_add_workflow_executions.sql` | Nieuwe tabel |
| `supabase/functions/trigger-blog-generation/index.ts` | Logging toevoegen |
| `supabase/functions/trigger-seo-webhook/index.ts` | Logging toevoegen |
| `supabase/functions/run-scheduled-blogs/index.ts` | Logging toevoegen |
| `supabase/functions/run-scheduled-seo/index.ts` | Logging toevoegen |
| `supabase/functions/get-saved-hours/index.ts` | Query workflow_executions + "Overig" → Mediabirds |

## Verwacht Resultaat

Na implementatie:
- Elke nieuwe SEO Blog of Zoekwoord trigger wordt gelogd met het correcte bedrijf
- De bespaarde uren breakdown toont **echte data** per bedrijf
- Historische data (van voor implementatie) valt onder "Overig" → Mediabirds
- Smart Charged krijgt alleen uren als zij daadwerkelijk triggers uitvoeren

## Belangrijke Opmerking

**Historische data** kan niet met terugwerkende kracht worden gecorrigeerd - de n8n API bevat niet welk bedrijf de execution triggerde. Vanaf het moment van implementatie worden alle nieuwe triggers correct gelogd.
