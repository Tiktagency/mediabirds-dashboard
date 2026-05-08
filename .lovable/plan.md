

# Plan: Compactere Tile Kleuren Layout

## Probleem

De "Tile Kleuren" component is aanzienlijk groter dan de "Tile Volgorde" component door:
- Twee grote live previews (h-20)
- Vier kleur-input rijen met dubbele inputs (color picker + hex input + preview)
- Twee reset knoppen

## Oplossing: Compactere Layout

De component wordt geoptimaliseerd door:
1. **Kleinere previews** naast elkaar plaatsen
2. **Inline kleur pickers** zonder aparte hex input velden
3. **Gecombineerde reset knop** onderaan

---

## Nieuwe Compacte Layout

```text
+------------------------------------------------+
|  Tile Kleuren                                  |
|  Pas de kleuren aan van je dashboard tiles.    |
|------------------------------------------------|
|                                                |
|  +------------------+  +------------------+    |
|  | 🕐 Bespaard     |  | 📅 Overige      |    |
|  | deze maand      |  | tiles            |    |
|  +------------------+  +------------------+    |
|                                                |
|  BESPAARD DEZE MAAND    OVERIGE TILES          |
|  Achtergrond: [🎨][██]  Achtergrond: [🎨][██]  |
|  Tekst:       [🎨][██]  Tekst:       [🎨][██]  |
|                                                |
|  [↺ Reset Bespaard]  [↺ Reset Overige]        |
+------------------------------------------------+
```

---

## Technische Wijzigingen

### Bestand: `src/components/admin/dashboard/TileColorCustomizer.tsx`

| Wijziging | Details |
|-----------|---------|
| Preview grootte | Van `h-20` naar `h-14` (kleiner) |
| Preview layout | Twee previews naast elkaar in een grid |
| Kleur inputs | Verwijder hex input veld, alleen color picker + preview swatch |
| Labels | Compacter met kleinere spacing |
| Reset knoppen | Twee kleinere knoppen naast elkaar |

### Verwachte Hoogte Reductie

| Element | Huidige Hoogte | Nieuwe Hoogte |
|---------|----------------|---------------|
| Preview 1 | 80px | 56px |
| Preview 2 | 80px | 56px (naast preview 1) |
| Kleur inputs | 4 rijen x ~50px | 4 rijen x ~36px |
| Reset knoppen | 2 x ~40px | 1 rij x ~36px |
| **Totaal besparing** | | ~150px minder |

---

## Code Aanpassingen

De belangrijkste wijzigingen:

1. **Previews naast elkaar in een 2-koloms grid**:
   - Beide tiles in één rij
   - Kleinere hoogte (h-14 ipv h-20)

2. **Compacte kleur-input rijen**:
   - Verwijder het hex tekst-input veld
   - Alleen color picker en preview swatch behouden
   - Achtergrond en Tekst op één rij per sectie

3. **Reset knoppen naast elkaar**:
   - Twee kleinere knoppen in een grid
   - Elk reset knopje voor zijn eigen sectie

Dit zorgt ervoor dat de "Tile Kleuren" card ongeveer dezelfde hoogte krijgt als de "Tile Volgorde" card met de 3x3 grid van tiles.

