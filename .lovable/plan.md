
# Plan: Correcte Berekening Bespaarde Uren

## Probleem Analyse

De huidige berekening van "Bespaard deze maand" is incorrect door meerdere issues:

### Issue 1: Geen Pagination
De `get-saved-hours` functie haalt slechts **100 executies per workflow** op (`limit=100`), terwijl er meer executies kunnen zijn. De `get-n8n-logs` functie gebruikt wel cursor-based pagination.

### Issue 2: Inconsistente Workflow Matching
De functie matcht workflows op basis van naam inclusie (`includes`), maar de `timeSavedMap` bevat alleen de base workflow namen uit `automation_settings`, niet de company-specifieke workflows.

### Issue 3: Mogelijke Dubbeltelling
Workflows zoals "SEO zoekwoorden" kunnen executies van meerdere company-specifieke workflows bevatten (TIKT, MEDIABIRDS) die mogelijk dubbel geteld worden.

---

## Oplossing

Herschrijf de `get-saved-hours` edge function om exact dezelfde logica te gebruiken als `get-n8n-logs`:

| Verbetering | Details |
|-------------|---------|
| **Pagination** | Cursor-based pagination om ALLE executies op te halen (max 30 dagen) |
| **Company workflows** | Haal company-specifieke workflow namen uit de `companies` tabel |
| **Time saved mapping** | Map company workflows naar de juiste `time_saved_per_execution` waarden |
| **Filtering op succes** | Alleen succesvolle executies tellen |
| **Geen input nodig** | De functie bepaalt zelf welke workflows relevant zijn |

---

## Nieuwe Functie Logica

```text
1. Haal automation_settings op (base workflow namen + time_saved)
2. Haal companies op (company-specifieke workflow namen)
3. Bouw timeSavedMap:
   - Base workflows: n8n_workflow_name → time_saved_per_execution
   - Company SEO research → zoekwoord-onderzoek's time_saved
   - Company blogs → blogs's time_saved
4. Haal alle n8n workflows op
5. Filter naar geconfigureerde workflows (exact match of contains)
6. Fetch ALLE executies met pagination (cursor-based, limit=250 per page)
7. Filter op succesvolle executies binnen 30 dagen
8. Bereken totaal: sum(executions × time_saved_per_execution) / 60
```

---

## Bestanden Wijzigingen

### 1. `supabase/functions/get-saved-hours/index.ts`

Volledige herschrijving met:

- Cursor-based pagination (identiek aan get-n8n-logs)
- Company workflow support
- Correcte time_saved mapping
- Geen input parameters nodig (bepaalt zelf welke workflows)

### 2. `src/hooks/useSavedHours.ts`

Kleine aanpassing:
- Geen `workflowNames` parameter meer nodig
- Simpelere API call zonder body

### 3. `src/components/dashboard/SavedHoursTile.tsx`

Kleine aanpassing:
- `workflowNames` prop verwijderen

### 4. `src/pages/Index.tsx`

Kleine aanpassing:
- `connectedWorkflowNames` berekening verwijderen
- `workflowNames` prop niet meer doorgeven aan SavedHoursTile

---

## Technische Details

De nieuwe berekening zal:

1. **Alle geconfigureerde workflows identificeren:**
   - automation_settings.n8n_workflow_name (MEDIABIRDS monday planning, MEDIABIRDS Alt-text Wordpress, etc.)
   - companies.seo_research_n8n_name (MEDIABIRDS zoekwoorden, TIKT zoekwoorden)
   - companies.subkeywords_n8n_name
   - companies.blogs_n8n_name (MEDIABIRDS seo, TIKT seo)

2. **Time saved per workflow correct mappen:**
   - Base workflows → hun eigen time_saved_per_execution
   - Company SEO research → automation_settings waar automation_name = 'zoekwoord-onderzoek'
   - Company blogs → automation_settings waar automation_name = 'seo-blog' OF 'blogs'

3. **Pagination gebruiken:**
   - Fetch in batches van 250 executies
   - Gebruik cursor voor volgende pagina
   - Stop als executies ouder dan 30 dagen worden

4. **Alleen succesvolle executies tellen:**
   - Filter op `status=success`

---

## Verwacht Resultaat

Na implementatie zal de "Bespaard deze maand" tile:
- Altijd actuele data tonen (geen hardcoded limieten)
- Correcte totalen tonen inclusief alle company-specifieke workflows
- Consistent zijn met wat de logs tonen
- Rond de ~50 uur tonen als dat de correcte waarde is
