
# Plan: Fix Button Colors op Gepubliceerde URL

## Probleem
De `useApplyButtonColors` hook past geen fallback kleuren toe wanneer:
1. De gebruiker niet is ingelogd
2. De settings niet kunnen worden geladen
3. De `button_colors` property niet bestaat in de database

In de huidige implementatie worden de CSS variabelen alleen gezet als `colors?.background` en `colors?.text` bestaan, maar er is geen fallback naar de standaardwaarden.

## Oplossing
Pas de `useApplyButtonColors` hook aan om **altijd** de knopkleuren toe te passen, met fallback naar de standaardwaarden wanneer er geen settings beschikbaar zijn.

---

## Technische wijziging

### Bestand: `src/hooks/useApplyButtonColors.ts`

**Huidige code:**
```typescript
useEffect(() => {
  if (isLoading) return;

  const root = document.documentElement;
  const colors = settings?.button_colors;

  if (colors?.background) {
    root.style.setProperty('--button-primary-bg', colors.background);
  }
  if (colors?.text) {
    root.style.setProperty('--button-primary-text', colors.text);
  }
}, [settings?.button_colors, isLoading]);
```

**Nieuwe code:**
```typescript
useEffect(() => {
  if (isLoading) return;

  const root = document.documentElement;
  const colors = settings?.button_colors;

  // Altijd fallback kleuren toepassen voor consistente branding
  const DEFAULT_BG = '#cfddd0';
  const DEFAULT_TEXT = '#002C1F';

  root.style.setProperty('--button-primary-bg', colors?.background || DEFAULT_BG);
  root.style.setProperty('--button-primary-text', colors?.text || DEFAULT_TEXT);
}, [settings?.button_colors, isLoading]);
```

---

## Belangrijk na implementatie

**Frontend wijzigingen moeten gepubliceerd worden:**
Na het doorvoeren van deze fix moet je op "Publish" > "Update" klikken om de wijziging live te zetten. Backend wijzigingen (database, edge functions) gaan automatisch live, maar frontend code moet expliciet gepubliceerd worden.

---

## Bestanden die aangepast worden

| Bestand | Wijziging |
|---------|-----------|
| `src/hooks/useApplyButtonColors.ts` | Fallback kleuren altijd toepassen |
