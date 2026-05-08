
# Plan: Webhook Body Structuur Aanpassen

## Overzicht

De webhook payload aanpassen naar het gewenste array-formaat met twee objecten: één voor de URL's en één voor de document IDs.

---

## Wijziging in `src/components/seo-blog/PageUrlForm.tsx`

**Huidige payload (regels 134-141):**
```typescript
const payload = {
  bedrijfsnaam: selectedCompany.name,
  spreadsheet_id: googleSheetId,
  grid_id: googleFileId,
  page_urls: urls.filter(url => url.trim()).map(url => url.trim()),
};
```

**Nieuwe payload:**
```typescript
const payload = [
  // Object 1: Genummerde URL's
  urls.reduce((acc, url, index) => {
    if (url.trim()) {
      acc[(index + 1).toString()] = url.trim();
    }
    return acc;
  }, {} as Record<string, string>),
  // Object 2: Document IDs
  {
    "Document ID": googleSheetId,
    "Slide ID": googleFileId,
  }
];
```

---

## Resultaat

**Nieuwe webhook body structuur:**
```json
[
  {
    "1": "https://example.com/sitemap1.xml",
    "2": "https://example.com/sitemap2.xml"
  },
  {
    "Document ID": "1IL1nRE-eiVFw0HtR8CCDiUC-6kBXb6aOOErRnwj3Pfk",
    "Slide ID": "0"
  }
]
```

| Element | Inhoud |
|---------|--------|
| Array[0] | URL's met genummerde keys ("1", "2", ...) |
| Array[1] | Document ID en Slide ID |
