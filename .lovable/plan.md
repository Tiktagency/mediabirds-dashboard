

## Pagina URL's sectie toevoegen aan Blog Generatie

### Wat verandert er
Er komt een nieuw kopje "Pagina URL's" in het Blog Generatie formulier dat de Spreadsheet ID en Grid ID toont uit de `page_url_settings` tabel. Deze velden zijn gekoppeld (gesynchroniseerd) aan de Pagina URL Instellingen pagina -- wijzigingen in het ene formulier worden direct weerspiegeld in het andere.

### Hoe het werkt
- De `usePageUrlSettings` hook wordt toegevoegd aan `BlogGenerationForm` om de Spreadsheet ID en Grid ID op te halen voor het geselecteerde bedrijf
- De velden worden als alleen-lezen weergegeven (niet bewerkbaar), aangezien de Pagina URL pagina de bron is voor deze gegevens
- De sectie verschijnt als een nieuw blok met het kopje "Pagina URL's", geplaatst na de "Google Documenten" sectie
- De waarden zijn altijd in sync: als je ze wijzigt op de Pagina URL pagina, zie je de bijgewerkte waarden hier

### Technische wijzigingen

**Bestand: `src/components/seo-blog/BlogGenerationForm.tsx`**
1. Import `usePageUrlSettings` hook toevoegen
2. Hook aanroepen met `selectedCompany?.id`
3. Na de "Google Documenten" sectie (regel 631) een nieuwe sectie toevoegen:
   - Kopje "Pagina URL's"
   - Twee alleen-lezen velden met gradient border (zelfde stijl als bedrijfsnaam):
     - "Spreadsheet ID" -- toont `settings.google_sheet_id` uit page_url_settings
     - "Grid ID" -- toont `settings.google_file_id` uit page_url_settings
   - Subtekst die aangeeft dat deze velden beheerd worden via de Pagina URL pagina

