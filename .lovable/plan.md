
# Plan: Twee Folder ID Velden voor Google Drive Foto's

## Overzicht

Bij de optie "Foto Google Drive" in de Blog Generatie pagina worden twee invulvelden toegevoegd:
1. **Foto map : Folder ID** - Hernoemd van het bestaande "Folder ID" veld
2. **Gebruikte foto map : Folder ID** - Nieuw veld voor de map met reeds gebruikte foto's

---

## Database Wijzigingen

### Nieuwe kolom toevoegen

Er wordt een nieuwe kolom `used_folder_id` toegevoegd aan de `blog_settings` tabel:

```sql
ALTER TABLE blog_settings 
ADD COLUMN used_folder_id TEXT;
```

---

## Hook Wijzigingen

**Bestand: `src/hooks/useBlogSettings.ts`**

De `BlogSettings` interface wordt uitgebreid met het nieuwe veld:

```typescript
export interface BlogSettings {
  // ... bestaande velden ...
  folder_id: string | null;
  used_folder_id: string | null;  // Nieuw veld
  // ...
}
```

---

## Formulier Wijzigingen

**Bestand: `src/components/seo-blog/BlogGenerationForm.tsx`**

### Form State uitbreiden

Nieuw veld toevoegen aan `formData`:

```typescript
const [formData, setFormData] = useState({
  // ... bestaande velden ...
  folder_id: '',
  used_folder_id: '',  // Nieuw
  // ...
});
```

### UI Aanpassingen

In de sectie waar "Foto Google Drive" actief is (rond regel 652-657), worden twee velden getoond in plaats van een:

```text
+------------------------------------------+
| Foto map : Folder ID                     |
| [abc123xyz...                      ]     |
+------------------------------------------+
| Gebruikte foto map : Folder ID           |
| [def456uvw...                      ]     |
+------------------------------------------+
```

### Validatie

Het `used_folder_id` veld is optioneel, dus de bestaande validatie in `isFormComplete()` blijft ongewijzigd - alleen `folder_id` is verplicht voor de Google Drive optie.

---

## Edge Function Wijzigingen

De webhook payload in `supabase/functions/trigger-blog-generation/index.ts` zal automatisch het nieuwe veld meesturen omdat het formulier de data doorstuurt.

---

## Samenvatting

| Component | Wijziging |
|-----------|-----------|
| Database | Nieuwe kolom `used_folder_id` in `blog_settings` |
| Hook | `used_folder_id` toevoegen aan interface |
| Formulier | Veldnaam wijzigen + tweede veld toevoegen |

## Resultaat

- Het bestaande "Folder ID" veld wordt hernoemd naar "Foto map : Folder ID"
- Een nieuw optioneel veld "Gebruikte foto map : Folder ID" wordt toegevoegd
- Beide velden worden per bedrijf opgeslagen
- De data wordt meegestuurd naar de webhook
