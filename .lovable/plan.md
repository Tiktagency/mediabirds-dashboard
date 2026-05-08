
# Fix: "E-mail signature" verwijderen - Verbeterde Regex

## Probleem
De huidige regex `^E-mail signature\s*` werkt alleen als de tekst exact aan het begin van de string staat. Er staat waarschijnlijk witruimte of een newline ervoor.

## Oplossing
Trim de string eerst, en voeg een extra regex toe die ook "E-mail signature" met voorafgaande witruimte/newlines verwijdert.

**Bestand:** `src/pages/EmailSignature.tsx`

### Huidige code (regels 11-31):
```tsx
const cleanHtmlForCopy = (html: string): string => {
  let cleaned = html;
  
  // Verwijder markdown code fences aan begin en einde
  cleaned = cleaned.replace(/^```html\s*/i, '');
  cleaned = cleaned.replace(/^```\s*E-mail signature\s*/i, '');
  cleaned = cleaned.replace(/^E-mail signature\s*/i, '');
  cleaned = cleaned.replace(/```\s*$/g, '');
  ...
```

### Nieuwe code:
```tsx
const cleanHtmlForCopy = (html: string): string => {
  let cleaned = html;
  
  // Verwijder markdown code fences aan begin en einde
  cleaned = cleaned.replace(/^```html\s*/i, '');
  cleaned = cleaned.replace(/^```\s*E-mail signature\s*/i, '');
  cleaned = cleaned.replace(/^E-mail signature\s*/i, '');
  cleaned = cleaned.replace(/```\s*$/g, '');
  
  // Trim en verwijder nogmaals "E-mail signature" (voor het geval er whitespace voor stond)
  cleaned = cleaned.trim();
  cleaned = cleaned.replace(/^E-mail signature\s*/i, '');
  ...
```

## Wijziging
Voeg een extra trim en regex toe halverwege de functie, zodat "E-mail signature" ook wordt gevangen wanneer er voorafgaande witruimte was.
