
# Plan: Pagina URL's als Aparte Array Versturen

## Overzicht

De webhook payload aanpassen zodat de pagina URL's als een aparte array worden verstuurd in plaats van als onderdeel van het hoofdobject.

---

## Wijziging in `src/components/seo-blog/PageUrlForm.tsx`

**Huidige payload structuur (regels 136-141):**
```typescript
const payload = {
  bedrijfsnaam: selectedCompany.name,
  spreadsheet_id: googleSheetId,
  grid_id: googleFileId,
  page_urls: pageUrls,  // Object: {"1": "url1", "2": "url2"}
};
```

**Nieuwe payload structuur:**
```typescript
const payload = {
  bedrijfsnaam: selectedCompany.name,
  spreadsheet_id: googleSheetId,
  grid_id: googleFileId,
  page_urls: urls.filter(url => url.trim()).map(url => url.trim()),  // Array: ["url1", "url2"]
};
```

---

## Resultaat

| Aspect | Oud | Nieuw |
|--------|-----|-------|
| Type | Object `{"1": "...", "2": "..."}` | Array `["...", "..."]` |
| Format | Genummerde keys | Simpele array van strings |

**Voorbeeld nieuwe payload:**
```json
{
  "bedrijfsnaam": "MediaBirds",
  "spreadsheet_id": "abc123",
  "grid_id": "xyz789",
  "page_urls": [
    "https://example.com/sitemap.xml",
    "https://example.com/services"
  ]
}
```
