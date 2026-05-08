

## Leads Generator: velden aanpassen + webhook koppeling

### Wat wordt er gedaan

1. De drie bestaande invulvelden worden vervangen door: **Plaatsnaam**, **Country** en **Zoektermen** (dynamisch, meerdere regels)
2. Een nieuwe edge function `trigger-leads-webhook` stuurt de data als POST naar de n8n webhook
3. De Start-knop roept deze edge function aan

### Wijzigingen

**`src/pages/LeadsGenerator.tsx`**

De state variabelen worden vervangen:
- `bedrijfsnaam` en `locatie` en `beschrijving` worden vervangen door `plaatsnaam` (string), `country` (string), en `zoektermen` (string array, start met `['']`)
- Nieuw veld **Plaatsnaam**: gewoon tekstveld
- Nieuw veld **Country**: gewoon tekstveld (Engels)
- Nieuw veld **Zoektermen**: een lijst van tekstvelden, start met 1 veld. Elke regel heeft een X-knop om te verwijderen (behalve als er maar 1 is). Onderaan een "+ Extra zoekterm" knop om een nieuw leeg veld toe te voegen
- Validatie: Start is enabled als plaatsnaam, country en minstens 1 niet-lege zoekterm zijn ingevuld
- De Start-knop roept `supabase.functions.invoke('trigger-leads-webhook', { body: { Plaatsnaam, Country, searchStringsArray } })` aan

**Nieuw: `supabase/functions/trigger-leads-webhook/index.ts`**

- CORS headers (standaard)
- Authenticatie check (JWT validatie)
- Ontvangt `{ Plaatsnaam, Country, searchStringsArray }` uit de request body
- Stuurt een POST naar `https://tikt.app.n8n.cloud/webhook/02ec49ee-d7cf-4e3e-bfba-7d71206d290b` met auth token (`BLOG_WEBHOOK_AUTH_TOKEN`)
- Geeft het webhook-resultaat terug aan de frontend

### Payload voorbeeld

```json
{
  "Plaatsnaam": "Amsterdam",
  "Country": "Netherlands",
  "searchStringsArray": [
    "marketing bureau",
    "webdesign",
    "SEO specialist"
  ]
}
```

### Bestanden

| Bestand | Actie |
|---|---|
| `src/pages/LeadsGenerator.tsx` | Velden vervangen + webhook aanroep |
| `supabase/functions/trigger-leads-webhook/index.ts` | Nieuw -- proxy naar n8n webhook |

