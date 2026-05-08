
# Webhook aanroep bij verwijderen bedrijf

## Wat verandert er

Bij het verwijderen van een bedrijf wordt na bevestiging een POST-request gestuurd naar de n8n webhook met de bedrijfsnaam. Dit gebeurt via een nieuwe backend function, zodat de auth token veilig blijft.

## Huidige situatie

- De bevestigingsdialoog bestaat al: "Weet je zeker dat je [naam] wilt verwijderen?"
- Na bevestiging worden `blog_settings` en het bedrijf uit de database verwijderd
- Er wordt nog geen webhook aangeroepen

## Aanpassingen

### 1. Nieuwe edge function: `trigger-delete-company-webhook`

Een nieuwe backend function die:
- De `bedrijfsnaam` ontvangt als parameter
- Een POST-request stuurt naar `https://tikt.app.n8n.cloud/webhook/dca2fe6c-13f7-43ab-8f19-33ed0d97fd18`
- De `BLOG_WEBHOOK_AUTH_TOKEN` secret gebruikt voor authenticatie (al geconfigureerd)
- De bedrijfsnaam meestuurt in de body als `{ bedrijfsnaam: "..." }`

### 2. CompanySelector.tsx: `handleDeleteCompany` uitbreiden

- Na bevestiging en voordat het bedrijf uit de database wordt verwijderd, wordt de webhook aangeroepen via de nieuwe edge function
- De `AlertDialogAction` krijgt `e.preventDefault()` om de dialoog open te houden tijdens het verwijderen
- Er verschijnt een laadsymbool met "Bezig met verwijderen..." tijdens de verwerking
- Als de webhook faalt, wordt het bedrijf alsnog verwijderd uit de database (met een waarschuwing)

## Technische details

### Edge function (`supabase/functions/trigger-delete-company-webhook/index.ts`)

- Standaard CORS headers
- Ontvangt `{ bedrijfsnaam: string }` in de request body
- POST naar de opgegeven webhook URL met `Authorization` header uit `BLOG_WEBHOOK_AUTH_TOKEN`
- Retourneert `{ success: true/false }`

### CompanySelector.tsx wijzigingen

- `handleDeleteCompany`: roept eerst `supabase.functions.invoke('trigger-delete-company-webhook', { body: { bedrijfsnaam: companyToDelete.name } })` aan
- `AlertDialogAction` onClick krijgt `e.preventDefault()` + aanroep naar `handleDeleteCompany()`
- Loading state toont `Loader2` spinner + "Bezig met verwijderen..."
