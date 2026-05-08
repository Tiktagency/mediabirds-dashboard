
# Plan: Knopkleuren Toepassen op Alle Primaire Knoppen

## Overzicht

De `primaryCustom` button variant toepassen op alle hoofdacties in de applicatie, zodat de in het Admin Panel ingestelde knopkleuren overal worden gebruikt.

---

## Te Wijzigen Bestanden

### 1. Monday Planning (`src/pages/MondayPlanning.tsx`)

**Regel 230-243** - "Start" knop:
```tsx
// Van:
<Button
  onClick={handleSubmit}
  disabled={!isFormValid || isSubmitting}
  className="w-full mt-4"
>

// Naar:
<Button
  onClick={handleSubmit}
  disabled={!isFormValid || isSubmitting}
  variant="primaryCustom"
  className="w-full mt-4"
>
```

---

### 2. Copyright Branding (`src/components/copyright-branding/CopyrightBrandingForm.tsx`)

**Regel 225-241** - "Genereer tekst" knop:
```tsx
// Van:
<Button
  onClick={handleSubmit}
  disabled={isLoading}
  className="w-full"
>

// Naar:
<Button
  onClick={handleSubmit}
  disabled={isLoading}
  variant="primaryCustom"
  className="w-full"
>
```

**Regel 327-343** - "Herschrijf tekst" knop:
```tsx
// Van:
<Button
  onClick={handleSubmit}
  disabled={isLoading}
  className="w-full"
>

// Naar:
<Button
  onClick={handleSubmit}
  disabled={isLoading}
  variant="primaryCustom"
  className="w-full"
>
```

---

### 3. SEO Zoekwoord Onderzoek (`src/components/seo-blog/KeywordResearchForm.tsx`)

**Regel 563-584** - "Start SEO onderzoek" knop:
```tsx
// Van:
<Button
  onClick={handleStartResearch}
  disabled={isSubmitting || !isFormComplete() || isScheduleEnabled}
  className="w-full seo-button-primary gap-2"
>

// Naar:
<Button
  onClick={handleStartResearch}
  disabled={isSubmitting || !isFormComplete() || isScheduleEnabled}
  variant="primaryCustom"
  className="w-full gap-2"
>
```

---

### 4. SEO Blog Generatie (`src/components/seo-blog/BlogGenerationForm.tsx`)

**Regel 728-744** - "Start" knop:
```tsx
// Van:
<Button 
  size="lg" 
  className="w-full py-6 text-lg h-auto"
  onClick={handleStartClick}
  disabled={isSubmitting || !isFormComplete() || isScheduleEnabled}
>

// Naar:
<Button 
  size="lg"
  variant="primaryCustom"
  className="w-full py-6 text-lg h-auto"
  onClick={handleStartClick}
  disabled={isSubmitting || !isFormComplete() || isScheduleEnabled}
>
```

---

## Samenvatting

| Bestand | Knop | Actie |
|---------|------|-------|
| `MondayPlanning.tsx` | "Start" | `variant="primaryCustom"` toevoegen |
| `CopyrightBrandingForm.tsx` | "Genereer tekst" | `variant="primaryCustom"` toevoegen |
| `CopyrightBrandingForm.tsx` | "Herschrijf tekst" | `variant="primaryCustom"` toevoegen |
| `KeywordResearchForm.tsx` | "Start SEO onderzoek" | `variant="primaryCustom"` + `seo-button-primary` verwijderen |
| `BlogGenerationForm.tsx` | "Start" | `variant="primaryCustom"` toevoegen |

---

## Resultaat

Na deze wijzigingen gebruiken alle primaire actieknoppen in de applicatie de kleuren die in het Admin Panel zijn ingesteld via de "Knopkleuren" customizer.
