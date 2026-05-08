

# Plan: HTML Code Card Hoogte Beperken tot Formulier

## Probleem

De HTML Code card groeit onbeperkt naar beneden door `flex-1`. De gebruiker wil dat deze card eindigt op dezelfde hoogte als het formulier (bij de Afbeeldingen sectie), niet bij de submit-knop.

---

## Huidige Situatie

De rechterkolom heeft `flex flex-col` met `flex-1` op de HTML Code card, waardoor deze onbeperkt groeit voorbij de hoogte van het middelste formulier.

---

## Oplossing

1. Voeg `overflow-hidden` toe aan de rechterkolom container zodat de inhoud wordt beperkt tot de grid cel hoogte
2. Behoud `flex-1` op de HTML Code card zodat deze de resterende ruimte gebruikt
3. De grid zorgt ervoor dat kolommen dezelfde hoogte hebben als de hoogste kolom

---

## Code Wijzigingen

**Bestand: `src/pages/EmailSignature.tsx`**

### Rechterkolom container aanpassen (regel 80)

Van:
```tsx
<div className="order-3 flex flex-col gap-4">
```

Naar:
```tsx
<div className="order-3 flex flex-col gap-4 overflow-hidden">
```

### HTML Code inner container min-height toevoegen (regel 147)

Van:
```tsx
<div className="bg-black/30 rounded-lg p-4 font-mono text-sm text-white/70 flex-1 overflow-auto">
```

Naar:
```tsx
<div className="bg-black/30 rounded-lg p-4 font-mono text-sm text-white/70 flex-1 overflow-auto min-h-0">
```

---

## Resultaat

- De rechterkolom wordt beperkt tot de hoogte van het formulier
- De HTML Code card neemt de beschikbare ruimte in (na de Preview)
- Als de HTML code te lang is, wordt het scrollbaar binnen de card
- De submit-knop blijft onder het formulier, niet uitgelijnd met de HTML Code card

