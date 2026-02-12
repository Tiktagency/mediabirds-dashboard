
# Google Document ID's synchroniseren tussen formulieren

## Wat verandert er

Wanneer een Spreadsheet ID of Grid ID wordt gewijzigd in een van de drie formulieren (Zoekwoord Onderzoek, Blog Generatie, of Pagina URL), worden de overeenkomstige velden in de andere tabellen automatisch bijgewerkt.

## Welke velden worden gesynchroniseerd

| Veld | Zoekwoord Onderzoek (seo_settings) | Blog Generatie (blog_settings) | Pagina URL (page_url_settings) |
|------|-------------------------------------|-------------------------------|-------------------------------|
| Spreadsheet ID | hoofd_google_sheet_id + nieuw_google_sheet_id | google_sheet_id | google_sheet_id |
| Grid ID | hoofd_google_slides_id | google_slides_id | google_file_id |

Wanneer een Spreadsheet ID verandert, worden alle 4 velden bijgewerkt (hoofd + nieuw in seo_settings, blog_settings en page_url_settings).
Wanneer een Grid ID verandert, worden alle 3 velden bijgewerkt (hoofd in seo_settings, blog_settings en page_url_settings).

## Aanpak

### Nieuwe gedeelde hook: `src/hooks/useGoogleDocSync.ts`

Een herbruikbare functie die de synchronisatie afhandelt. Wanneer aangeroepen met een `companyId`, het gewijzigde veldtype (`sheet_id` of `slides_id`) en de nieuwe waarde, worden alle gerelateerde tabellen bijgewerkt via directe Supabase upserts.

### Wijzigingen per formulier

**1. KeywordResearchForm.tsx**
- Na het opslaan van `hoofd_google_sheet_id`, `hoofd_google_slides_id`, `nieuw_google_sheet_id` of `nieuw_google_slides_id`: de sync-functie aanroepen
- Bij wijziging van een Spreadsheet ID: blog_settings.google_sheet_id, page_url_settings.google_sheet_id en het andere SEO-veld (hoofd/nieuw) bijwerken
- Bij wijziging van Grid ID (hoofd): blog_settings.google_slides_id en page_url_settings.google_file_id bijwerken

**2. BlogGenerationForm.tsx**
- Na het opslaan van `google_sheet_id`: seo_settings (hoofd + nieuw) en page_url_settings bijwerken
- Na het opslaan van `google_slides_id`: seo_settings (hoofd) en page_url_settings bijwerken

**3. PageUrlForm.tsx**
- Na het opslaan van `google_sheet_id`: seo_settings (hoofd + nieuw) en blog_settings bijwerken
- Na het opslaan van `google_file_id`: seo_settings (hoofd) en blog_settings bijwerken

## Technische details

De sync-hook voert upserts uit op de andere twee tabellen (niet de tabel waar de wijziging vandaan komt). De upserts gebruiken `onConflict: 'company_id'` om bestaande records bij te werken of nieuwe aan te maken indien nodig.

De synchronisatie is "fire-and-forget" vanuit het perspectief van de gebruiker -- fouten worden gelogd maar blokkeren het opslaan van het originele veld niet. De lokale formulier-state wordt niet automatisch bijgewerkt (pas bij herladen of wisselen van bedrijf), maar de database is altijd consistent.
