

## Bedrijfsnaam live bijwerken in dropdown + "Start" knop met webhook

### Wat er verandert
1. Als je de bedrijfsnaam aanpast in het bewerkbare veld, wordt de naam direct ook bijgewerkt in de dropdown rechtsboven (zonder herladen)
2. Er komt een "Start" knop onder de bedrijfsgegevens
3. Bij klik op "Start" worden de bedrijfsgegevens als POST-request verstuurd naar de alt-tekst webhook
4. Authenticatie via dezelfde methode als bij de blogs (`BLOG_WEBHOOK_AUTH_TOKEN`)

### Aanpassingen

**1. `src/components/wordpress-alt-text/AltTextCompanySelector.tsx`**
- Voeg een `selectedCompany` prop toe zodat de parent component de geselecteerde company kan bijwerken (naam wijzigingen)
- Synchroniseer de weergegeven naam in de dropdown-trigger met de externe `selectedCompany` prop
- Voeg een `refreshCompanies` functie/ref toe of gebruik de prop-waarde direct om de lijst en trigger-tekst bij te werken

**2. `src/pages/WordpressAltText.tsx`**
- Na het opslaan van een naamswijziging: geef de bijgewerkte company direct door aan de selector
- Voeg een "Start" knop toe onder de bedrijfsgegevens card
- Knop stuurt een POST-request via een nieuwe edge function met de bedrijfsgegevens
- Laadstatus en feedback via toast-meldingen

**3. Nieuwe edge function: `supabase/functions/trigger-alt-text-webhook/index.ts`**
- Ontvangt de bedrijfsgegevens (naam, domein) van de frontend
- Leest `BLOG_WEBHOOK_AUTH_TOKEN` uit de environment
- Stuurt een POST-request naar `https://tikt.app.n8n.cloud/webhook/b6d054ac-4c1b-4091-8369-f3f7e1bbca72` met de data
- Retourneert het resultaat naar de frontend
- Inclusief CORS headers en JWT-validatie

### Technische details

**Dropdown synchronisatie:**
De `AltTextCompanySelector` krijgt een `selectedCompany` prop die van buitenaf de huidige geselecteerde company bepaalt. Wanneer de naam in `WordpressAltText.tsx` wordt aangepast en opgeslagen, wordt `setSelectedCompany` bijgewerkt en de selector toont direct de nieuwe naam.

**Edge function payload:**
```json
{
  "bedrijfsnaam": "Reneko Kozijnen",
  "domain": "reneko.nl"
}
```

**Edge function authenticatie:**
- Gebruikt `BLOG_WEBHOOK_AUTH_TOKEN` secret (al geconfigureerd)
- Stuurt deze als `Authorization` header naar de n8n webhook
- Frontend roept de edge function aan via `supabase.functions.invoke('trigger-alt-text-webhook', { body: { ... } })`

**Start knop UX:**
- Laadsymbool tijdens verwerking
- Toast-melding bij succes of fout
- Knop disabled als er geen bedrijf is geselecteerd

