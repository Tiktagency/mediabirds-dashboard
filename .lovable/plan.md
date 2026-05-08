

## Leads Generator "laatste succesvol uitgevoerd" fixen

### Probleem

De `trigger-leads-webhook` edge function werkt correct, maar na een succesvolle uitvoering wordt de `automation_status` tabel niet bijgewerkt. Er bestaat geen rij voor `leads-generator` in die tabel, waardoor de tooltip altijd "Nooit" toont.

Andere automations (zoals Copyright Branding en Email Handtekening) updaten hun `last_run` in `automation_status` na succesvolle uitvoering. De leads generator doet dit niet.

### Oplossing

**Bestand: `supabase/functions/trigger-leads-webhook/index.ts`**

Na een succesvolle webhook-response (wanneer `response.ok` en `data.success` true is), een upsert doen naar de `automation_status` tabel:

```ts
// Na succesvolle response, automation_status updaten
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
if (supabaseUrl && serviceRoleKey) {
  const supabaseClient = createClient(supabaseUrl, serviceRoleKey);
  await supabaseClient
    .from('automation_status')
    .upsert({
      automation_name: 'leads-generator',
      status: 'active',
      last_run: new Date().toISOString(),
      last_updated: new Date().toISOString(),
    }, { onConflict: 'automation_name' });
}
```

Dit is hetzelfde patroon dat `rewrite-text` gebruikt voor `copyright-branding` en `trigger-email-signature` voor `email-handtekening`.

### Wijzigingen

| Bestand | Wat |
|---|---|
| `supabase/functions/trigger-leads-webhook/index.ts` | Supabase client import toevoegen + upsert naar `automation_status` na succesvolle run |

Na deze wijziging zal de volgende succesvolle uitvoering van de leads generator direct zichtbaar zijn in de tooltip op het dashboard.

