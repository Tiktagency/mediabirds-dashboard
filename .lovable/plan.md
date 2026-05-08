
# Plan: Auto-Save en Webhook Trigger voor Pagina URL Formulier

## Overzicht

Twee hoofdwijzigingen:
1. Automatisch opslaan van velden wanneer ze worden gewijzigd (zoals de andere formulieren)
2. De "Opslaan" knop omzetten naar een webhook trigger knop genaamd "URL's documenteren"

---

## Wijzigingen in `src/components/seo-blog/PageUrlForm.tsx`

### 1. Nieuwe state en imports toevoegen

- `isSubmitting` state voor webhook loading
- `useToast` hook voor feedback
- Supabase client import voor webhook aanroep

### 2. Auto-save functionaliteit

**Spreadsheet ID veld:**
- `onBlur` handler toevoegen die automatisch opslaat naar database

**Grid ID veld:**
- `onBlur` handler toevoegen die automatisch opslaat naar database

**URL velden:**
- Na elke wijziging + blur automatisch opslaan

### 3. Webhook trigger functie

Nieuwe `handleTriggerWebhook` functie:
```typescript
const WEBHOOK_URL = 'https://tikt.app.n8n.cloud/webhook/ce22d18b-67ef-4e24-aa76-a9f94ec69986';

const handleTriggerWebhook = async () => {
  // Eerst data opslaan
  // Dan POST request naar webhook met alle form data
  // Toast notification tonen met response
};
```

**Payload structuur:**
```json
{
  "bedrijfsnaam": "Company Name",
  "spreadsheet_id": "...",
  "grid_id": "...",
  "page_urls": { "1": "url1", "2": "url2" }
}
```

### 4. Button aanpassen

**Van:**
```tsx
<Button onClick={handleSave}>Opslaan</Button>
```

**Naar:**
```tsx
<Button onClick={handleTriggerWebhook} disabled={!hasValidUrl || isSubmitting}>
  {isSubmitting ? <Loader2 /> : "URL's documenteren"}
</Button>
```

---

## Technische Details

| Aspect | Implementatie |
|--------|---------------|
| Auto-save trigger | `onBlur` event op input velden |
| Webhook methode | Direct fetch naar n8n URL |
| Error handling | Toast notifications voor succes/fout |
| Notification opslaan | Via `saveNotification` prop (zoals andere forms) |

---

## Resultaat

- Velden worden automatisch opgeslagen bij verlaten
- Knop heet "URL's documenteren"
- Bij klikken wordt alle data naar de webhook gestuurd
- Gebruiker krijgt feedback via toast notifications
