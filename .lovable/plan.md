
# Plan: Arrow-Shaped Navigation Tiles

## Overzicht
De drie navigatie-tiles op de SEO pagina omvormen tot arrow/chevron-vormige elementen die naar rechts wijzen, vergelijkbaar met de referentie-afbeelding.

---

## Visueel ontwerp

```text
┌────────────────┐    ┌────────────────┐    ┌────────────────┐
│                │╲   │                │╲   │                │
│  1. Pagina URL │ ╲  │ 2. Zoekwoord   │ ╲  │ 3. Blog        │
│                │  ╲ │    Onderzoek   │  ╲ │    Generatie   │
│                │  ╱ │                │  ╱ │                │
│                │ ╱  │                │ ╱  │                │
└────────────────┘╱   └────────────────┘╱   └────────────────┘
```

Elke tile krijgt:
- Een puntige rechterrand (chevron/arrow shape)
- Nummering om volgorde aan te geven
- Dezelfde kleurenschema als nu (secondary/accent voor actieve states)

---

## Technische aanpak

**Bestand:** `src/pages/SeoBlog.tsx`

1. **CSS Pseudo-elements toevoegen** via Tailwind's `before:` en `after:` classes om de arrow-shape te creëren
2. **Clip-path gebruiken** voor een moderne arrow-vorm, of CSS triangles met borders
3. **Nummering toevoegen** aan elke tile ("1.", "2.", "3.")

**Alternatief:** Custom CSS classes in `src/index.css` voor de arrow-shape styling

---

## Implementatie details

### Optie 1: Clip-path (moderne browsers)
```css
clip-path: polygon(0 0, calc(100% - 20px) 0, 100% 50%, calc(100% - 20px) 100%, 0 100%, 20px 50%);
```

### Optie 2: CSS Pseudo-elements
- `::after` element met border-trick voor de rechter arrow-punt
- `::before` element voor de linker inham (behalve eerste tile)

---

## Bestanden die aangepast worden

| Bestand | Wijziging |
|---------|-----------|
| `src/pages/SeoBlog.tsx` | Arrow-shape styling en nummering toevoegen |
| `src/index.css` | (optioneel) Custom arrow-tile classes |
