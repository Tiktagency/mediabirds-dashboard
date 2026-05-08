
# Plan: Nieuwe "Pagina URL" Sectie Toevoegen

## Overzicht

Een derde klikbare kaart "Pagina URL" toevoegen naast "Zoekwoord Onderzoek" en "Blog Generatie" op de SEO-pagina. Deze sectie bevat een formulier met:
- Bedrijfsnaam
- Google Sheet Document ID
- Google File ID
- Dynamische URL-invoervelden (meerdere links mogelijk)

---

## Database Wijzigingen

### Nieuwe Tabel: `page_url_settings`

```sql
CREATE TABLE page_url_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  google_sheet_id TEXT,
  google_file_id TEXT,
  page_urls JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id)
);

-- RLS policies
ALTER TABLE page_url_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read page_url_settings"
  ON page_url_settings FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert page_url_settings"
  ON page_url_settings FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update page_url_settings"
  ON page_url_settings FOR UPDATE TO authenticated USING (true);
```

De `page_urls` kolom slaat de URLs op als een genummerd JSON-object:
```json
{
  "1": "https://smart-charged.nl/page-sitemap.xml",
  "2": "https://smart-charged.nl/product-sitemap.xml"
}
```

---

## Nieuwe Bestanden

### 1. Hook: `src/hooks/usePageUrlSettings.ts`

Hook voor het ophalen en opslaan van page URL instellingen per bedrijf:
- `settings`: huidige instellingen
- `isLoading`: laadstatus
- `saveSettings()`: opslaan van wijzigingen
- Automatisch laden bij wijziging van `companyId`

### 2. Formulier Component: `src/components/seo-blog/PageUrlForm.tsx`

Formulier met:
- **Bedrijfsnaam** (alleen-lezen, uit geselecteerd bedrijf)
- **Google Sheet Document ID** (bewerkbaar invoerveld)
- **Google File ID** (bewerkbaar invoerveld)
- **Pagina URLs** sectie:
  - Dynamische lijst van URL-invoervelden
  - "URL toevoegen" knop voor extra velden
  - Verwijderknop per URL
  - URLs worden genummerd opgeslagen (1, 2, 3, ...)
- **Start knop** (met `primaryCustom` variant)

---

## Bestaande Bestanden Wijzigen

### `src/pages/SeoBlog.tsx`

1. **Type uitbreiden** (regel 22):
```tsx
type ActiveView = 'none' | 'keyword' | 'blog' | 'pageurl';
```

2. **Import toevoegen**:
```tsx
import { PageUrlForm } from '@/components/seo-blog/PageUrlForm';
import { Link as LinkIcon } from 'lucide-react';
```

3. **Grid aanpassen** (regel 200):
Van `grid-cols-2` naar `grid-cols-3` voor drie knoppen

4. **Derde knop toevoegen** (na regel 273):
Nieuwe button met:
- Label: "Pagina URL"
- Ondertitel: "Sitemap URLs verzamelen"
- Icoon: `LinkIcon`
- Kleur: Oranje/amber thema (bijv. `bg-orange-500`)

5. **Formulier toevoegen** (na regel 308):
```tsx
<div className={cn(
  "seo-card p-8 md:p-10 transition-opacity duration-200",
  activeView === 'pageurl' ? "opacity-100" : "hidden"
)}>
  <PageUrlForm
    selectedCompany={selectedCompany}
    setSelectedCompany={setSelectedCompany}
    isAdmin={isAdmin}
    user={user}
    saveNotification={saveNotification}
  />
</div>
```

---

## Webhook Payload Formaat

Bij het versturen naar de webhook wordt de volgende structuur gebruikt:

```json
{
  "bedrijfsnaam": "Smart Charged",
  "google_sheet_id": "1abc...",
  "google_file_id": "2def...",
  "page_urls": {
    "1": "https://smart-charged.nl/page-sitemap.xml",
    "2": "https://smart-charged.nl/product-sitemap.xml"
  }
}
```

---

## UI/UX Details

### Dynamische URL Velden

- Elk URL-veld heeft een nummer label ("URL 1", "URL 2", etc.)
- Verwijderknop (prullenbak icoon) naast elk veld
- "URL toevoegen" knop onderaan de lijst
- Automatische hernummering bij verwijderen

### Validatie

- Start knop alleen actief wanneer minstens één URL is ingevuld
- Google IDs zijn optioneel maar aanbevolen
- URL formaat validatie (moet met http:// of https:// beginnen)

---

## Visueel Overzicht

```text
+------------------+------------------+------------------+
|  🔍 Zoekwoord   |  📄 Blog        |  🔗 Pagina URL  |
|   Onderzoek     |   Generatie     |                  |
|                  |                  |                  |
| AI-gestuurd SEO | Automatische    | Sitemap URLs     |
| onderzoek       | blogposts maken | verzamelen       |
+------------------+------------------+------------------+

[Geselecteerde sectie klapt hieronder uit]
```

---

## Technische Samenvatting

| Item | Actie |
|------|-------|
| Database tabel | `page_url_settings` aanmaken met RLS |
| Hook | `usePageUrlSettings.ts` aanmaken |
| Component | `PageUrlForm.tsx` aanmaken |
| SeoBlog.tsx | ActiveView type + 3-koloms grid + nieuwe kaart + form |
| Button | `primaryCustom` variant voor Start knop |
