
# Plan: HTML Opschonen bij Kopiëren

## Probleem
De gegenereerde HTML bevat:
1. Extra tekst bovenaan ("Met vriendelijke groet, Kind Regards")
2. Overtollige witruimte en lege elementen
3. Extra spatie tussen e-mail en locatie

## Oplossing
Schoon de HTML op voordat deze naar het klembord wordt gekopieerd door:
1. De greeting tekst te verwijderen
2. Overtollige witruimte/lege tags op te ruimen
3. De dubbele spatie tussen e-mail en locatie te corrigeren

## Wijzigingen

**Bestand:** `src/pages/EmailSignature.tsx`

### 1. Voeg een helper functie toe om HTML op te schonen

```tsx
const cleanHtmlForCopy = (html: string): string => {
  let cleaned = html;
  
  // Verwijder "Met vriendelijke groet, Kind Regards" en variaties
  cleaned = cleaned.replace(/Met vriendelijke groet,?\s*Kind Regards\s*/gi, '');
  
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

### 2. Gebruik de helper bij het kopiëren (regels 135-157)

De onClick handler aanpassen om `cleanHtmlForCopy` te gebruiken:

```tsx
onClick={async () => {
  try {
    const cleanedHtml = cleanHtmlForCopy(generatedHtml!);
    const blob = new Blob([cleanedHtml], { type: 'text/html' });
    const clipboardItem = new ClipboardItem({ 'text/html': blob });
    await navigator.clipboard.write([clipboardItem]);
    
    toast({
      title: 'Gekopieerd',
      description: 'Handtekening is gekopieerd met opmaak - plak direct in je e-mail',
    });
  } catch (err) {
    const cleanedHtml = cleanHtmlForCopy(generatedHtml!);
    await navigator.clipboard.writeText(cleanedHtml);
    toast({
      title: 'Gekopieerd',
      description: 'HTML code gekopieerd (plak in bronweergave van je e-mail)',
    });
  }
}}
```

## Samenvatting

| Wijziging | Beschrijving |
|-----------|--------------|
| `cleanHtmlForCopy` functie | Verwijdert greeting tekst en overtollige witruimte |
| onClick handler | Roept cleaning functie aan voordat HTML wordt gekopieerd |
| Preview ongewijzigd | De preview toont nog steeds de volledige HTML |

## Resultaat
De kopieer functie levert een schone handtekening zonder de "Met vriendelijke groet" tekst en zonder overtollige spaties.
