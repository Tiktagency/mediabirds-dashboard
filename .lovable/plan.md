## Doel

Voor het demo account `luc.degraag@student.hu.nl` moet de "Bespaard deze maand"-tegel altijd **75.2 uur** tonen, met een consistente onderliggende breakdown (per bedrijf, per workflow, executie-aantallen en periode) zodat ook de info-tooltip kloppende cijfers laat zien.

Voor alle andere gebruikers (waaronder `hello@tikt.ai`) blijft de bestaande live berekening uit n8n + `workflow_executions` ongewijzigd.

## Aanpak

De cijfers worden centraal in de edge function `get-saved-hours` afgevangen, zodat zowel de tegel, de tooltip als eventuele toekomstige consumers automatisch dezelfde demo-data zien. Geen wijzigingen aan de frontend nodig.

### Stap 1 — Detecteer demo-gebruiker in de edge function

Aan het begin van `supabase/functions/get-saved-hours/index.ts` (direct na de auth-check):

- Haal `profiles.is_demo` op voor de ingelogde user (met de service-role client die er al is).
- Beschouw ook expliciet `email === 'luc.degraag@student.hu.nl'` als demo (zelfde regel als `useIsDemoUser`).
- Is de user demo → return direct een vaste mock-response. Geen n8n-call.

### Stap 2 — Vaste mock-payload (totaal exact 75.2 uur)

Periode: laatste 30 dagen (`periodStart` = nu − 30 dagen, `periodEnd` = nu), zodat de tooltip-periode klopt met "Bespaard deze maand".

Breakdown (minuten worden in de tooltip omgerekend naar uren via `/60`, totals worden geconsumeerd zoals ze zijn):

```text
Mediabirds                       3000 min   50.0 uur
  - SEO Blog          40 runs × 30 min  = 1200 min  (20.0 uur)
  - SEO Zoekwoorden   30 runs × 30 min  =  900 min  (15.0 uur)
  - Monday Planning   16 runs × 45 min  =  720 min  (12.0 uur)
  - Alt-text          60 runs ×  3 min  =  180 min  ( 3.0 uur)

Demo Bakkerij                     900 min   15.0 uur
  - SEO Blog          20 runs × 30 min  =  600 min  (10.0 uur)
  - Alt-text         100 runs ×  3 min  =  300 min  ( 5.0 uur)

Demo Webshop                      612 min   10.2 uur
  - SEO Blog          18 runs × 30 min  =  540 min  ( 9.0 uur)
  - Alt-text          24 runs ×  3 min  =   72 min  ( 1.2 uur)

Totaal                           4512 min   75.2 uur
Executies (som van runs):                       308
```

De response heeft exact dezelfde shape als de echte berekening, zodat `useSavedHours` / `SavedHoursTile` / `SavedHoursInfoTooltip` zonder aanpassing werken:

```ts
{
  totalHours: 75.2,
  totalMinutes: 4512,
  executionCount: 308,
  periodStart, periodEnd,
  breakdownByCompany: {
    "Mediabirds":     { totalMinutes: 3000, totalHours: 50.0, workflows: { ... } },
    "Demo Bakkerij":  { totalMinutes:  900, totalHours: 15.0, workflows: { ... } },
    "Demo Webshop":   { totalMinutes:  612, totalHours: 10.2, workflows: { ... } },
  }
}
```

### Stap 3 — Frontend cache invalideren

`useSavedHours` cached de response 1 uur in `localStorage` onder `saved_hours_cache`. Voor demo-users blijft dat werken (cijfers zijn vast), dus geen wijziging nodig. Bestaande non-demo users overschrijven hun cache automatisch bij de volgende fetch.

## Bestanden

- `supabase/functions/get-saved-hours/index.ts` — demo-check + vaste payload toevoegen.

Geen DB-wijzigingen, geen frontend-wijzigingen.
