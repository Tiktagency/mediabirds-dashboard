
# Webhook aanroepen bij bedrijf toevoegen

## Wat verandert er

Wanneer je op "Toevoegen" klikt in het dialoogvenster voor een nieuw bedrijf, wordt na het succesvol opslaan in de database een POST-request gestuurd naar de n8n webhook met de bedrijfsnaam. De authenticatie gebruikt dezelfde `BLOG_WEBHOOK_AUTH_TOKEN` secret als de blog "Start" knop.

## Aanpak

Er wordt een nieuwe edge function aangemaakt die de webhook aanroept. Dit is nodig omdat de `BLOG_WEBHOOK_AUTH_TOKEN` secret alleen beschikbaar is in edge functions (niet in de browser).

### 1. Nieuwe edge function: `trigger-add-company-webhook`

**Bestand:** `supabase/functions/trigger-add-company-webhook/index.ts`

- Ontvangt een POST-request met `{ companyName: string }` in de body
- Valideert de gebruiker via JWT
- Haalt `BLOG_WEBHOOK_AUTH_TOKEN` op uit de secrets
- Stuurt een POST-request naar `https://tikt.app.n8n.cloud/webhook/add1509b-90d0-4e56-87ea-1492614e3b62` met de bedrijfsnaam
- Gebruikt dezelfde CORS-headers en foutafhandeling als bestaande edge functions

### 2. CompanySelector aanpassen

**Bestand:** `src/components/seo/CompanySelector.tsx`

In de `handleAddCompany` functie, na het succesvol opslaan van het bedrijf in de database (regel 168-176):
- Een aanroep toevoegen naar de nieuwe edge function via `supabase.functions.invoke('trigger-add-company-webhook', { body: { companyName: newCompanyName.trim() } })`
- Fouten bij de webhook-aanroep worden gelogd maar blokkeren het toevoegen niet (het bedrijf is al opgeslagen)

### 3. Supabase config

**Bestand:** `supabase/config.toml`

- Toevoegen: `[functions.trigger-add-company-webhook]` met `verify_jwt = false`

## Technische details

- De webhook URL wordt hardcoded in de edge function (niet in de frontend)
- Authenticatie: `BLOG_WEBHOOK_AUTH_TOKEN` secret (al geconfigureerd)
- De webhook-aanroep is "fire and forget" -- als het mislukt, is het bedrijf wel al aangemaakt in de database
- De payload naar de webhook bevat: `{ bedrijfsnaam: "naam" }`
