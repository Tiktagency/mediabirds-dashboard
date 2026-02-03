
# Plan: Kopiëren met Behoud van Opmaak naar E-mailprogramma's

## Probleem
Bij het selecteren en kopiëren van de preview gaat de opmaak verloren in Gmail. Dit komt doordat:
1. De preview is geschaald met CSS transform (`scale-[0.65]`)
2. Browser selection kopieert de visuele weergave, niet de oorspronkelijke HTML
3. E-mailprogramma's kunnen de getransformeerde content niet correct interpreteren

## Oplossing
Gebruik de Clipboard API met het `text/html` MIME type om de originele HTML direct naar het klembord te kopiëren. Dit behoudt alle opmaak en layout.

## Wijzigingen

**Bestand:** `src/pages/EmailSignature.tsx`

**Locatie:** Preview Card - Button onClick handler (regels 132-151)

### Huidige code:
```tsx
onClick={() => {
  if (previewRef.current) {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(previewRef.current);
    selection?.removeAllRanges();
    selection?.addRange(range);
    
    toast({
      title: 'Geselecteerd',
      description: 'Druk op Ctrl+C (of Cmd+C) om te kopiëren',
    });
  }
}}
```

### Nieuwe code:
```tsx
onClick={async () => {
  try {
    // Gebruik Clipboard API met HTML MIME type voor behoud van opmaak
    const blob = new Blob([generatedHtml], { type: 'text/html' });
    const clipboardItem = new ClipboardItem({ 'text/html': blob });
    await navigator.clipboard.write([clipboardItem]);
    
    toast({
      title: 'Gekopieerd',
      description: 'Handtekening is gekopieerd met opmaak - plak direct in je e-mail',
    });
  } catch (err) {
    // Fallback: kopieer als plain text als ClipboardItem niet wordt ondersteund
    await navigator.clipboard.writeText(generatedHtml);
    toast({
      title: 'Gekopieerd',
      description: 'HTML code gekopieerd (plak in bronweergave van je e-mail)',
      variant: 'default',
    });
  }
}}
```

### Knoptekst aanpassen:
```tsx
<Copy className="w-4 h-4 mr-1" />
Kopieer
```

## Samenvatting

| Wijziging | Beschrijving |
|-----------|--------------|
| onClick handler | Kopieert HTML met `text/html` MIME type via Clipboard API |
| Fallback | Plain text kopiëren als ClipboardItem niet ondersteund wordt |
| Knoptekst | "Selecteer" → "Kopieer" |
| Toast | Direct feedback dat het klaar is om te plakken |

## Technische Details
- `ClipboardItem` met `text/html` MIME type zorgt dat e-mailprogramma's de HTML als rich text interpreteren
- Fallback naar `writeText` voor oudere browsers
- Geen afhankelijkheid van CSS transform of DOM selection

## Resultaat
Gebruikers klikken op "Kopieer", de handtekening wordt met volledige opmaak naar het klembord gekopieerd, en kan direct in Gmail of andere e-mailprogramma's worden geplakt met behoud van layout.
