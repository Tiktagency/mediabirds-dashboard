
## Analyse: Ontbrekende velden in automatische triggers

### Blog trigger (`run-scheduled-blogs`) — ontbrekende velden

De handmatige "Start" knop stuurt in `blogData`:
- `page_url_spreadsheet_id` — uit `page_url_settings.google_sheet_id`
- `page_url_grid_id` — uit `page_url_settings.google_file_id`
- `page_urls` — het hele `page_urls` JSON object uit `page_url_settings`
- `folder_id` (alleen als `image_type === 'google_drive'`)
- `used_folder_id` (alleen als `image_type === 'google_drive'`)
- `image_type` — `'ai_image'` of `'google_drive'`
- `aantal_woorden` als string range `"500-1500"` ✅ (zit er al in)

De scheduler stuurt **niet**:
- `page_url_spreadsheet_id`, `page_url_grid_id`, `page_urls` — ontbreekt volledig
- `folder_id`, `used_folder_id` — worden altijd leeg gestuurd
- `image_type` — wordt niet meegestuurd

### SEO trigger (`run-scheduled-seo`) — is al correct

De SEO scheduler stuurt alle velden die ook de handmatige knop stuurt (`blogTopic`, `audienceIntent`, `businessDescription`, etc.). Dit is al correct.

### Fix: `run-scheduled-blogs/index.ts`

Na het ophalen van `blogSettings` ook `page_url_settings` ophalen:

```typescript
const { data: pageUrlSettings } = await supabase
  .from('page_url_settings')
  .select('*')
  .eq('company_id', company.id)
  .maybeSingle();
```

Dan de payload uitbreiden:

```typescript
const blogPayload = {
  bedrijfsnaam: blogSettings.bedrijfsnaam || company.name,
  // ... bestaande velden ...
  
  // image type velden
  image_type: blogSettings.image_type || 'ai_image',
  folder_id: blogSettings.image_type === 'google_drive' ? (blogSettings.folder_id || '') : '',
  used_folder_id: blogSettings.image_type === 'google_drive' ? (blogSettings.used_folder_id || '') : '',
  achtergrond_kleur: blogSettings.image_type !== 'google_drive' ? (blogSettings.achtergrond_kleur || '') : '',
  hoofdaccent_gradient: blogSettings.image_type !== 'google_drive' ? (blogSettings.hoofdaccent_gradient || '') : '',
  
  // page URL velden
  page_url_spreadsheet_id: pageUrlSettings?.google_sheet_id || '',
  page_url_grid_id: pageUrlSettings?.google_file_id || '',
  page_urls: pageUrlSettings?.page_urls || {},
  
  timestamp: new Date().toISOString(),
  triggered_from: 'scheduled',
};
```

### Bestand

| Bestand | Aanpassing |
|---|---|
| `supabase/functions/run-scheduled-blogs/index.ts` | `page_url_settings` ophalen + ontbrekende velden toevoegen aan payload |
