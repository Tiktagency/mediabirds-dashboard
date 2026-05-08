

# Foto folder ID's automatisch invullen bij bedrijf toevoegen

## Wat verandert er

Wanneer een nieuw bedrijf wordt toegevoegd, stuurt de n8n webhook nu ook `"Folder Foto's"` en `"Folder gebruikte foto's"` mee met daarin Folder ID's. Deze moeten automatisch worden opgeslagen in de `blog_settings` tabel, zodat de velden "Foto map : Folder ID" en "Gebruikte foto map : Folder ID" al ingevuld zijn.

## Technisch

**Bestand: `supabase/functions/trigger-add-company-webhook/index.ts`**

1. De webhook response data uitlezen voor de twee nieuwe keys:
   - `webhookData['Folder Foto\'s']` -> `folder_id` in blog_settings
   - `webhookData['Folder gebruikte foto\'s']` -> `used_folder_id` in blog_settings

2. Deze waarden toevoegen aan het bestaande `blogUpsertData` object (regels 68-77), zodat ze samen met de andere blog_settings worden opgeslagen:

```typescript
const folderPhotos = webhookData["Folder Foto's"] || {};
const folderUsedPhotos = webhookData["Folder gebruikte foto's"] || {};

// Toevoegen aan blogUpsertData:
blogUpsertData.folder_id = toNull(folderPhotos['Folder ID']);
blogUpsertData.used_folder_id = toNull(folderUsedPhotos['Folder ID']);
```

Geen database wijzigingen nodig -- de kolommen `folder_id` en `used_folder_id` bestaan al in de `blog_settings` tabel.

