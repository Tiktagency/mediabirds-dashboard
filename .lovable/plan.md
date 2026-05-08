
# Plan: Preview Kopieerknop - Selecteer Inhoud i.p.v. Code Kopiëren

## Doel
De kopieerknop in de Preview sectie moet de inhoud van de preview selecteren (niet de HTML code kopiëren), zodat gebruikers de geformatteerde handtekening kunnen kopiëren met opmaak intact.

## Wijziging

**Bestand:** `src/pages/EmailSignature.tsx`

**Locatie:** Preview Card - Button onClick handler (regels 135-143)

### Huidige code:
```tsx
onClick={async () => {
  await navigator.clipboard.writeText(generatedHtml);
  setIsCopied(true);
  toast({
    title: 'Gekopieerd',
    description: 'HTML code is naar het klembord gekopieerd',
  });
  setTimeout(() => setIsCopied(false), 2000);
}}
```

### Nieuwe code:
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

### Knoptekst aanpassen:
```tsx
<Copy className="w-4 h-4 mr-1" />
Selecteer
```

## Samenvatting

| Wijziging | Beschrijving |
|-----------|--------------|
| onClick handler | Selecteert preview inhoud met `window.getSelection()` |
| Toast melding | Instructie om Ctrl+C te gebruiken |
| Knoptekst | "Kopieer" → "Selecteer" |

## Resultaat
Gebruikers klikken op de knop, de volledige handtekening wordt geselecteerd (blauw gemarkeerd), en ze kunnen dan Ctrl+C gebruiken om de geformatteerde handtekening te kopiëren naar hun e-mailprogramma.
