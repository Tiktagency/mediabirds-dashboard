
# Plan: Tile Achtergrondkleur Aanpassen

## Overzicht
De achtergrondkleur van de inactieve arrow tiles wijzigen naar #212122.

---

## Kleuranalyse

| Element | Huidige waarde | Nieuwe waarde |
|---------|----------------|---------------|
| Inactieve tile achtergrond | `bg-white/5` | `bg-[#212122]` |
| Hover state | `hover:bg-white/10` | `hover:bg-[#2a2a2b]` |
| Tekst op inactieve tile | `text-white` | `text-white` (behouden) |

**Contrast check:** #212122 (donkergrijs) met witte tekst geeft uitstekend contrast (ratio ~15:1), dus tekstkleur hoeft niet aangepast te worden.

---

## Technische wijziging

**Bestand:** `src/pages/SeoBlog.tsx`

Drie locaties aanpassen (tiles 1, 2 en 3):

```typescript
// Van:
"bg-white/5 hover:bg-white/10"

// Naar:
"bg-[#212122] hover:bg-[#2a2a2b]"
```

---

## Bestanden die aangepast worden

| Bestand | Wijziging |
|---------|-----------|
| `src/pages/SeoBlog.tsx` | Achtergrondkleur van 3 inactieve tiles wijzigen naar #212122 |
