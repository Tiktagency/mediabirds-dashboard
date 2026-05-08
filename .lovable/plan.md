
# Plan: Forceer Selecteerbaarheid voor Alle Elementen in Email Handtekening Preview

## Probleem
Het oranje achtergrondvlak in de gegenereerde email handtekening is niet selecteerbaar. Dit komt waarschijnlijk doordat de gegenereerde HTML inline styles bevat zoals `user-select: none` of `-webkit-user-select: none` die de Tailwind classes overschrijven.

## Oplossing
Voeg extra CSS styling toe die ook webkit prefixes afdwingt en pointer-events correct instelt. Dit zorgt ervoor dat ALLE elementen selecteerbaar worden, ongeacht hun inline styles.

## Wijziging

**Bestand:** `src/pages/EmailSignature.tsx`

**Regels 131-135:** Uitbreiden met inline style die selectie afdwingt

```tsx
// Was:
<div 
  className="origin-top-left scale-[0.65] [&_*]:!select-text [&_*]:!cursor-text select-text cursor-text"
  style={{ width: '154%' }}
  dangerouslySetInnerHTML={{ __html: generatedHtml }} 
/>

// Wordt:
<div 
  className="origin-top-left scale-[0.65] [&_*]:!select-text [&_*]:!cursor-text select-text cursor-text"
  style={{ width: '154%' }}
>
  <style>{`
    .email-signature-preview * {
      user-select: text !important;
      -webkit-user-select: text !important;
      -moz-user-select: text !important;
      -ms-user-select: text !important;
      cursor: text !important;
      pointer-events: auto !important;
    }
  `}</style>
  <div 
    className="email-signature-preview"
    dangerouslySetInnerHTML={{ __html: generatedHtml }} 
  />
</div>
```

## Technische Details
- `user-select: text !important` - Standaard CSS
- `-webkit-user-select: text !important` - Safari/Chrome
- `-moz-user-select: text !important` - Firefox  
- `-ms-user-select: text !important` - Edge/IE
- `pointer-events: auto !important` - Zorgt dat klikken/selecteren werkt op alle elementen

## Resultaat
Na deze wijziging zijn alle elementen in de email handtekening preview selecteerbaar:
- Oranje achtergrondvlakken
- Tekst
- Afbeeldingen
- Tabellen en cellen

Dit werkt voor zowel de huidige als toekomstige gegenereerde handtekeningen.
