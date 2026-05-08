
# Fix: Verwijder "E-mail signature" tekst

## Probleem
De tekst "E-mail signature" verschijnt nog steeds bovenaan de gekopieerde handtekening. Dit komt doordat de regex alleen zoekt naar ` ```E-mail signature ` maar de tekst staat ook los (zonder code fences).

## Oplossing
Voeg een extra regex toe aan de `cleanHtmlForCopy` functie om ook de losse "E-mail signature" tekst te verwijderen.

**Bestand:** `src/pages/EmailSignature.tsx`

### Huidige code (regel 14-16):
```tsx
cleaned = cleaned.replace(/^```html\s*/i, '');
cleaned = cleaned.replace(/^```\s*E-mail signature\s*/i, '');
cleaned = cleaned.replace(/```\s*$/g, '');
```

### Nieuwe code:
```tsx
cleaned = cleaned.replace(/^```html\s*/i, '');
cleaned = cleaned.replace(/^```\s*E-mail signature\s*/i, '');
cleaned = cleaned.replace(/^E-mail signature\s*/i, '');  // Losse tekst
cleaned = cleaned.replace(/```\s*$/g, '');
```

## Resultaat
De "E-mail signature" tekst wordt verwijderd, ongeacht of deze met of zonder code fences verschijnt.
