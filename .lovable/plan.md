

# Bedrijfsnaam automatisch invullen en dialoog verbeteren

## Wat verandert er

1. **Bevestigingsdialoog toont laadsymbool**: Na bevestiging verschijnt een spinner met "Bezig met aanmaken..." (dit werkt al deels, maar moet gecontroleerd worden dat de dialoog open blijft tijdens het laden)
2. **Bedrijfsnaam automatisch invullen in blog_settings**: Bij het aanmaken van een bedrijf wordt het `bedrijfsnaam` veld in `blog_settings` automatisch gevuld met de opgegeven bedrijfsnaam, zodat dit op elke tab meteen zichtbaar is

## Aanpassingen

### 1. Edge function: `trigger-add-company-webhook/index.ts`

In de `blog_settings` upsert wordt `bedrijfsnaam: companyName` toegevoegd. Hierdoor wordt het veld "Bedrijfsnaam" op de Blog-tab automatisch ingevuld met de naam die bij het aanmaken is opgegeven.

### 2. CompanySelector: dialoog-flow controleren

De huidige implementatie heeft al een `isCreating` state en een `Loader2` spinner in de bevestigingsdialoog. Het probleem is dat de `AlertDialogAction` standaard de dialoog sluit bij klikken. De `onClick` handler moet vervangen worden door het voorkomen van het standaard sluitgedrag, zodat de dialoog open blijft totdat het hele proces is afgerond. Dit wordt opgelost door:

- De `AlertDialogAction` om te bouwen zodat het standaard sluit-gedrag wordt voorkomen (via `e.preventDefault()`)
- De dialoog sluit pas na succesvolle of mislukte afronding van het aanmaakproces

## Technische details

- `blog_settings` heeft al een `bedrijfsnaam` kolom (type `text`, nullable) -- geen migratie nodig
- `seo_settings` heeft geen `bedrijfsnaam` kolom; de SEO-tabs (KeywordResearchForm) gebruiken `selectedCompany?.name` direct, dus daar is geen aanpassing nodig
- De `AlertDialogAction` krijgt `e.preventDefault()` in de onClick handler om het automatisch sluiten van de AlertDialog te voorkomen tijdens het laden
