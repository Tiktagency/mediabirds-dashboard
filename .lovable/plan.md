
# Plan: Labels Hernoemen naar Spreadsheet ID en Grid ID

## Overzicht

Alle labels voor Google Sheet/Slides/File ID velden hernoemen in de drie SEO formulieren:
- "Google Sheet Document ID" / "Google Sheet ID" → **Spreadsheet ID**
- "Google Slides ID" / "Google File ID" → **Grid ID**

---

## Wijzigingen per Bestand

### 1. `src/components/seo-blog/KeywordResearchForm.tsx`

**Hoofd zoekwoorden sectie (regels 533-534):**
- `'Google Sheet ID'` → `'Spreadsheet ID'`
- `'Google Slides ID'` → `'Grid ID'`

**Nieuwe zoekwoorden sectie (regels 545-546):**
- `'Google Sheet ID'` → `'Spreadsheet ID'`
- `'Google Slides ID'` → `'Grid ID'`

### 2. `src/components/seo-blog/BlogGenerationForm.tsx`

**Google Documenten sectie (regels 680-681):**
- `'Google Sheet Document ID'` → `'Spreadsheet ID'`
- `'Google Slides ID'` → `'Grid ID'`

### 3. `src/components/seo-blog/PageUrlForm.tsx`

**Labels en placeholders (regels 121-141):**
- Label: `Google Sheet Document ID` → `Spreadsheet ID`
- Placeholder: `Voer Google Sheet ID in...` → `Voer Spreadsheet ID in...`
- Label: `Google File ID` → `Grid ID`
- Placeholder: `Voer Google File ID in...` → `Voer Grid ID in...`

---

## Resultaat

Na de wijzigingen worden alle drie de formulieren consistent:

| Formulier | Oud Label | Nieuw Label |
|-----------|-----------|-------------|
| Zoekwoord Onderzoek | Google Sheet ID | Spreadsheet ID |
| Zoekwoord Onderzoek | Google Slides ID | Grid ID |
| Blog Generatie | Google Sheet Document ID | Spreadsheet ID |
| Blog Generatie | Google Slides ID | Grid ID |
| Pagina URL | Google Sheet Document ID | Spreadsheet ID |
| Pagina URL | Google File ID | Grid ID |
