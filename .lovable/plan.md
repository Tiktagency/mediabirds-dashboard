
# Plan: Maak Email Handtekening Preview Volledig Selecteerbaar

## Probleem
De email handtekening preview bevat gegenereerde HTML die mogelijk `user-select: none` CSS heeft, waardoor componenten en vlakken niet selecteerbaar zijn.

## Oplossing
Voeg CSS toe aan de preview container die `user-select: text !important` afdwingt op ALLE onderliggende elementen, inclusief:
- Tekst
- Achtergrondvlakken (divs, tables)
- Afbeeldingen
- Links

## Wijziging

**Bestand:** `src/pages/EmailSignature.tsx`

**Regels 131-135:** Update de preview div styling

| Was | Wordt |
|-----|-------|
| `<div className="origin-top-left scale-[0.65]"` | `<div className="origin-top-left scale-[0.65] [&_*]:!select-text [&_*]:!cursor-text select-text cursor-text"` |

### Uitleg CSS Classes:
- `[&_*]:!select-text` - Forceert `user-select: text` op ALLE child elementen (de `!` maakt het `!important`)
- `[&_*]:!cursor-text` - Toont tekst-cursor voor alle children (visuele feedback)
- `select-text` - Maakt de container zelf ook selecteerbaar
- `cursor-text` - Cursor voor de container

## Samenvatting

| Bestand | Wijziging |
|---------|-----------|
| `src/pages/EmailSignature.tsx` | CSS classes toevoegen voor volledige selecteerbaarheid |

## Resultaat
Na deze wijziging kunnen gebruikers:
- Alle tekst in de preview selecteren
- Achtergrondvlakken selecteren
- De volledige handtekening selecteren en kopiëren via Ctrl+C
