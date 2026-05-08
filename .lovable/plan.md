
# Webhook response data opslaan bij toevoegen bedrijf

## Wat verandert er

Wanneer een nieuw bedrijf wordt toegevoegd, wacht het systeem op de webhook-response en slaat de teruggekomen Google Document ID's automatisch op in de juiste database-tabellen.

## Veldmapping van webhook-response naar database

De webhook stuurt dit terug:
```text
{
  "Hoofd zoekwoorden": { "Spreadsheet ID": "...", "Grid ID": "..." },
  "Nieuwe zoekwoorden": { "Spreadsheet ID": "...", "Grid ID": "..." },
  "Pagina URL": { "Spreadsheet ID": "...", "Grid ID": "..." }
}
```

Dit wordt als volgt opgeslagen:

| Webhook veld | Database tabel | Database kolom |
|---|---|---|
| Hoofd zoekwoorden > Spreadsheet ID | seo_settings | hoofd_google_sheet_id |
| Hoofd zoekwoorden > Grid ID | seo_settings | hoofd_google_slides_id |
| Nieuwe zoekwoorden > Spreadsheet ID | seo_settings | nieuw_google_sheet_id |
| Nieuwe zoekwoorden > Grid ID | seo_settings | nieuw_google_slides_id |
| Hoofd zoekwoorden > Spreadsheet ID | blog_settings | google_sheet_id |
| Hoofd zoekwoorden > Grid ID | blog_settings | google_slides_id |
| Pagina URL > Spreadsheet ID | page_url_settings | google_sheet_id |
| Pagina URL > Grid ID | page_url_settings | google_file_id |

## Aanpak

### 1. Edge function aanpassen: `trigger-add-company-webhook`

- De webhook-response wordt nu als JSON geparsed in plaats van weggegooid
- De geparsde data wordt samen met `companyId` teruggestuurd naar de frontend
- Retourneert: `{ success: true, data: { ... } }`

### 2. Edge function uitbreiden: data opslaan via Supabase

De edge function slaat de data direct op in de database met de Supabase service role client. Dit is betrouwbaarder dan het vanuit de frontend te doen. De function:
- Maakt een Supabase client aan met de service role key
- Doet een upsert op `seo_settings`, `blog_settings` en `page_url_settings` met de ontvangen ID's
- Gebruikt `onConflict: 'company_id'` (de UNIQUE constraints zijn al aanwezig op seo_settings en blog_settings; page_url_settings heeft dit ook al)

### 3. CompanySelector aanpassen

- De webhook-aanroep verandert van "fire-and-forget" naar `await`
- Tijdens het wachten blijft de "Toevoegen..." staat actief (button disabled)
- Bij succes: toast met bevestiging dat de documenten zijn aangemaakt
- Bij fout: het bedrijf is wel aangemaakt, maar een waarschuwing wordt getoond dat de documenten handmatig ingevuld moeten worden

## Technische details

- De edge function gebruikt `createClient` met `SUPABASE_URL` en `SUPABASE_SERVICE_ROLE_KEY` (beide al geconfigureerd als secrets)
- De `page_url_settings` tabel heeft al een UNIQUE constraint op `company_id`
- Lege Grid ID waarden (lege string) worden opgeslagen als `null` in de database
