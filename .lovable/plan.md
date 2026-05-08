
# Fix: HTML Opschonen - Code Fences Verwijderen

## Probleem
De `cleanHtmlForCopy` functie doet momenteel het verkeerde:
1. Verwijdert "Met vriendelijke groet, Kind Regards" - maar dit moet BEHOUDEN blijven
2. Verwijdert NIET de markdown code fences - maar deze moeten WEL weg

## Oplossing
Pas de `cleanHtmlForCopy` functie aan:

**Bestand:** `src/pages/EmailSignature.tsx`

### Huidige code (fout):
```tsx
const cleanHtmlForCopy = (html: string): string => {
  let cleaned = html;
  
  // Verwijder "Met vriendelijke groet, Kind Regards" en variaties
  cleaned = cleaned.replace(/Met vriendelijke groet,?\s*Kind Regards\s*/gi, '');
  
  // ... rest
};
```

### Nieuwe code (correct):
```tsx
const cleanHtmlForCopy = (html: string): string => {
  let cleaned = html;
  
  // Verwijder markdown code fences aan begin en einde
  cleaned = cleaned.replace(/^```html\s*/i, '');
  cleaned = cleaned.replace(/^```\s*E-mail signature\s*/i, '');
  cleaned = cleaned.replace(/```\s*$/g, '');
  
  // Verwijder lege paragrafen en divs met alleen whitespace
  cleaned = cleaned.replace(/<p[^>]*>\s*(&nbsp;|\s)*\s*<\/p>/gi, '');
  cleaned = cleaned.replace(/<div[^>]*>\s*(&nbsp;|\s)*\s*<\/div>/gi, '');
  
  // Verwijder dubbele &nbsp; en overtollige witruimte
  cleaned = cleaned.replace(/(&nbsp;\s*){3,}/gi, '&nbsp;');
  
  // Trim leading/trailing whitespace
  cleaned = cleaned.trim();
  
  return cleaned;
};
```

## Samenvatting

| Was | Wordt |
|-----|-------|
| Verwijdert greeting tekst | Behoudt greeting tekst |
| Behoudt code fences | Verwijdert code fences (`\`\`\`html`, `\`\`\``) |

## Resultaat
De handtekening wordt gekopieerd met "Met vriendelijke groet, Kind Regards" intact, zonder de markdown code fences.
