
# Plan: Headers Toevoegen aan Formulieren

## Overzicht
Headers toevoegen boven het "Bedrijf" veld in de Zoekwoord Onderzoek en Blog Generatie formulieren, vergelijkbaar met de bestaande header in het Pagina URL formulier.

---

## Huidige situatie

| Formulier | Header aanwezig? |
|-----------|------------------|
| Pagina URL | ✅ "Pagina URL Instellingen" |
| Zoekwoord Onderzoek | ❌ Geen header |
| Blog Generatie | ❌ Geen header |

---

## Te implementeren

### 1. KeywordResearchForm.tsx (regel 493)

Toevoegen na `<div className="space-y-6">`:
```tsx
<h2 className="text-xl font-semibold text-white mb-6">Zoekwoord onderzoek instellingen</h2>
```

### 2. BlogGenerationForm.tsx (regel 575)

Toevoegen na `<div className="space-y-6">`:
```tsx
<h2 className="text-xl font-semibold text-white mb-6">Blog generatie instellingen</h2>
```

---

## Styling

De headers gebruiken dezelfde styling als de bestaande header in PageUrlForm:
- `text-xl` - grotere tekst
- `font-semibold` - semi-vetgedrukt
- `text-white` - witte kleur
- `mb-6` - marge onder de header

---

## Bestanden die aangepast worden

| Bestand | Wijziging |
|---------|-----------|
| `src/components/seo-blog/KeywordResearchForm.tsx` | Header "Zoekwoord onderzoek instellingen" toevoegen |
| `src/components/seo-blog/BlogGenerationForm.tsx` | Header "Blog generatie instellingen" toevoegen |
