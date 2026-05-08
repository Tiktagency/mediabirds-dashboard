

# Plan: Reset Knop en Layout Aanpassing Tile Kleuren

## Overzicht

1. **Reset knop toevoegen** aan de TileColorCustomizer om terug te keren naar standaard kleuren
2. **Layout herschikken** zodat Tile Kleuren direct rechts van Tile Volgorde staat
3. **Thema component verplaatsen** naar een andere locatie in de rechterkolom

---

## Huidige Layout

```text
+------------------------+------------------------+
|                        |  ThemeSwitch           |
|  TileOrganizer         |  TileColorCustomizer   |
|  (Tile Volgorde)       |  ColorCustomizer       |
|                        |  (Impact Kleuren)      |
+------------------------+------------------------+
```

## Nieuwe Layout

```text
+------------------------+------------------------+
|  TileOrganizer         |  TileColorCustomizer   |
|  (Tile Volgorde)       |  (met Reset knop)      |
+------------------------+------------------------+
|  ThemeSwitch           |  ColorCustomizer       |
|                        |  (Impact Kleuren)      |
+------------------------+------------------------+
```

---

## Bestanden die worden aangepast

| Bestand | Wijziging |
|---------|-----------|
| `src/components/admin/dashboard/TileColorCustomizer.tsx` | Reset knop toevoegen |
| `src/components/admin/dashboard/DashboardTab.tsx` | Layout herschikken |

---

## Technische Details

### 1. TileColorCustomizer - Reset Knop

Een reset knop toevoegen die de kleuren terugzet naar de standaard waarden:
- **Achtergrond**: `#cfddd0`
- **Tekst**: `#002C1F`

De reset knop komt onderaan de card, onder de kleur pickers. Bij klikken worden beide kleuren tegelijk gereset.

```tsx
// Nieuwe prop voor reset functionaliteit
interface TileColorCustomizerProps {
  colors: TileColors;
  onUpdate: (colors: { background?: string; text?: string }) => Promise<void>;
  onReset: () => Promise<void>;  // Nieuwe prop
}
```

De reset knop krijgt een `RotateCcw` icoon en de tekst "Reset naar standaard".

### 2. DashboardTab - Layout Herschikking

De grid layout wordt aangepast van een 2-koloms layout naar een meer gestructureerde opzet:

**Eerste rij (2 kolommen):**
- Links: TileOrganizer (Tile volgorde)
- Rechts: TileColorCustomizer (Tile kleuren met reset)

**Tweede rij (2 kolommen):**
- Links: ThemeSwitch (Thema)
- Rechts: ColorCustomizer (Impact kleuren)

---

## Visueel Ontwerp Reset Knop

```text
+----------------------------------------------+
|  Tile Kleuren                                |
|  Pas de kleuren aan van je dashboard tiles.  |
|----------------------------------------------|
|  Preview: [Mini tile preview]                |
|                                              |
|  Achtergrond: [🎨] [#cfddd0] [██]            |
|  Tekst:       [🎨] [#002C1F] [██]            |
|                                              |
|  [↺ Reset naar standaard]                    |
+----------------------------------------------+
```

De reset knop is een subtiele outline button die past bij de rest van het admin panel design.

