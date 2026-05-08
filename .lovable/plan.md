
# Google Document ID's synchroniseren tussen formulieren

## Geïmplementeerd

Spreadsheet ID en Grid ID worden gesynchroniseerd tussen `seo_settings` en `blog_settings` (niet `page_url_settings`).

| Veld | Zoekwoord Onderzoek (seo_settings) | Blog Generatie (blog_settings) |
|------|-------------------------------------|-------------------------------|
| Spreadsheet ID | hoofd_google_sheet_id + nieuw_google_sheet_id | google_sheet_id |
| Grid ID | hoofd_google_slides_id | google_slides_id |

Sync is fire-and-forget via `src/hooks/useGoogleDocSync.ts`.
