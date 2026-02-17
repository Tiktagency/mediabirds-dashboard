
## Pagina URL's data meesturen naar webhook

### Wat verandert er
Wanneer je op de "Start" knop klikt in het Blog Generatie formulier, worden de Spreadsheet ID en Grid ID uit de Pagina URL instellingen meegestuurd in de webhook payload.

### Technische wijzigingen

**Bestand: `src/components/seo-blog/BlogGenerationForm.tsx`**
- In de `handleStartClick` functie (rond regel 240-264) worden twee nieuwe velden toegevoegd aan het `payload` object:
  - `page_url_spreadsheet_id` -- de Spreadsheet ID uit `pageUrlSettings?.google_sheet_id`
  - `page_url_grid_id` -- de Grid ID uit `pageUrlSettings?.google_file_id`
  - `page_urls` -- het object met sitemap-URL's uit `pageUrlSettings?.page_urls`
- Deze worden na `google_slides_id` (regel 258) toegevoegd

De `pageUrlSettings` data is al beschikbaar in de component via de eerder toegevoegde `usePageUrlSettings` hook, dus er zijn geen extra imports of hooks nodig.
