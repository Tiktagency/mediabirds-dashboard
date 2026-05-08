

## Start-knop koppelen aan eigen webhook

### Wat verandert er

De Start-knop op de Landingspagina stuurt de data naar een **eigen webhook URL** in plaats van de alt-text webhook. De edge function wacht op het antwoord van n8n en stuurt dat terug. Het antwoord wordt als toast-melding 5 seconden in beeld getoond.

### Stappen

**1. Nieuwe edge function: `trigger-landing-webhook`**

Een eigen edge function die:
- De payload ontvangt (bedrijfsnaam, domain, app_password, spreadsheet_id, grid_id)
- POST stuurt naar `https://tikt.app.n8n.cloud/webhook/a726f693-304a-4400-b08c-40d2748517f8`
- Wacht op het antwoord en stuurt dat terug naar de frontend
- Authenticatie via `BLOG_WEBHOOK_AUTH_TOKEN` (al geconfigureerd)

**2. Landingspagina aanpassen**

- `handleStart` roept `trigger-landing-webhook` aan in plaats van `trigger-alt-text-webhook`
- Het webhook-antwoord wordt als toast getoond met een duur van 5 seconden (5000ms)

### Technische details

**Nieuwe edge function `supabase/functions/trigger-landing-webhook/index.ts`:**
- Zelfde structuur als `trigger-alt-text-webhook` (auth check, CORS, etc.)
- Haalt `app_password` op uit `landing_companies` (niet `alt_text_companies`)
- Stuurt naar de nieuwe webhook URL
- Wacht op response en stuurt die terug

**Aanpassing `src/pages/Landingspagina.tsx` -- `handleStart`:**
```typescript
const { data, error } = await supabase.functions.invoke('trigger-landing-webhook', {
  body: {
    bedrijfsnaam: selectedCompany.name,
    domain: selectedCompany.domain,
    spreadsheet_id: editSheetId,
    grid_id: editGridId,
  },
});

// Toast met 5 seconden duur
toast({
  title: 'Resultaat',
  description: message,
  duration: 5000,
});
```

### Bestanden

| Bestand | Actie |
|---|---|
| `supabase/functions/trigger-landing-webhook/index.ts` | Nieuw -- eigen edge function voor landingspagina webhook |
| `src/pages/Landingspagina.tsx` | `handleStart` aanpassen: nieuwe function + toast 5 sec |

