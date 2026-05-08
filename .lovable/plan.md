
# Plan: Conditionele Afbeelding Velden in Payload

## Overzicht

Wanneer een gebruiker een afbeeldingsoptie selecteert ("AI afbeelding" of "Foto Google Drive"), mogen alleen de velden voor de gekozen optie worden meegestuurd in de POST request. De velden voor de niet-gekozen optie moeten leeg worden meegestuurd.

---

## Huidige Situatie

Momenteel worden alle afbeelding-gerelateerde velden altijd meegestuurd:

```typescript
const payload = {
  // ... andere velden ...
  achtergrond_kleur: formData.achtergrond_kleur,
  hoofdaccent_gradient: `${formData.hoofdaccent_gradient_1},${formData.hoofdaccent_gradient_2}`,
  folder_id: formData.folder_id,
  used_folder_id: formData.used_folder_id,
  // ...
};
```

---

## Gewenste Situatie

De payload moet conditioneel worden opgebouwd op basis van `image_type`:

| Geselecteerde optie | Velden met waarde | Velden die leeg moeten zijn |
|---------------------|-------------------|---------------------------|
| AI afbeelding | `achtergrond_kleur`, `hoofdaccent_gradient` | `folder_id`, `used_folder_id` |
| Foto Google Drive | `folder_id`, `used_folder_id` | `achtergrond_kleur`, `hoofdaccent_gradient` |

---

## Code Wijzigingen

**Bestand: `src/components/seo-blog/BlogGenerationForm.tsx`**

### Payload aanpassen (rond regel 265-285)

De payload constructie wordt aangepast zodat velden conditioneel worden gevuld:

```typescript
const payload = {
  bedrijfsnaam: formData.bedrijfsnaam,
  bedrijfsomschrijving: formData.bedrijfsomschrijving,
  schrijfstijl: formData.schrijfstijl,
  aantal_woorden: `${formData.aantal_woorden[0]}-${formData.aantal_woorden[1]}`,
  taal: formData.taal,
  // AI afbeelding velden - alleen vullen als ai_image geselecteerd
  achtergrond_kleur: formData.image_type === 'ai_image' ? formData.achtergrond_kleur : '',
  hoofdaccent_gradient: formData.image_type === 'ai_image' 
    ? `${formData.hoofdaccent_gradient_1},${formData.hoofdaccent_gradient_2}` 
    : '',
  // Google Drive velden - alleen vullen als google_drive geselecteerd
  folder_id: formData.image_type === 'google_drive' ? formData.folder_id : '',
  used_folder_id: formData.image_type === 'google_drive' ? formData.used_folder_id : '',
  // ... rest van de velden ...
};
```

---

## Resultaat

- Bij **AI afbeelding**: `achtergrond_kleur` en `hoofdaccent_gradient` bevatten waarden, `folder_id` en `used_folder_id` zijn leeg
- Bij **Foto Google Drive**: `folder_id` en `used_folder_id` bevatten waarden, `achtergrond_kleur` en `hoofdaccent_gradient` zijn leeg
- De webhook ontvangt een schone payload met alleen de relevante afbeeldingsdata
