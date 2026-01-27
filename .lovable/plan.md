

# Plan: Eigen Kleurenpalet voor "Bespaard deze maand" Tile

## Overzicht

De "Bespaard deze maand" tile krijgt een eigen kleurenpalet, onafhankelijk van de andere dashboard tiles. Dit zorgt voor visuele differentiatie tussen de statistiek-tile en de navigatie-tiles.

---

## Kleuren Configuratie

| Tile | Achtergrond | Tekst |
|------|-------------|-------|
| **Bespaard deze maand** (nieuw) | `#f2eadc` (beige/crème) | `#412700` (donkerbruin) |
| **Overige tiles** (bestaand) | `#cfddd0` (sage groen) | `#002C1F` (donkergroen) |

---

## Wat wordt aangepast

### Bestanden die worden aangepast:

| Bestand | Wijziging |
|---------|-----------|
| `src/hooks/useDashboardSettings.ts` | Nieuwe `saved_hours_colors` property toevoegen aan interface en hook |
| `src/components/admin/dashboard/TileColorCustomizer.tsx` | Tweede sectie met kleurpickers voor SavedHours tile |
| `src/components/dashboard/SavedHoursTile.tsx` | Nieuwe prop voor eigen kleuren |
| `src/components/admin/dashboard/TileOrganizer.tsx` | Preview bijwerken met aparte kleuren |
| `src/components/admin/dashboard/DashboardTab.tsx` | Nieuwe kleuren doorgeven |
| `src/pages/Index.tsx` | Aparte kleuren doorgeven aan SavedHoursTile |

---

## Technische Details

### 1. Interface Uitbreiden (useDashboardSettings.ts)

```typescript
export interface DashboardSettings {
  // ... bestaande velden
  tile_colors: TileColors;           // Voor navigatie tiles
  saved_hours_colors: TileColors;    // NIEUW: Voor "Bespaard deze maand" tile
}

const DEFAULT_SAVED_HOURS_COLORS: TileColors = {
  background: '#f2eadc',
  text: '#412700',
};
```

Nieuwe functie:
```typescript
const updateSavedHoursColors = async (colors: { background?: string; text?: string }) => {
  // Opslaan in dashboard_colors.saved_hours_colors
};
```

### 2. TileColorCustomizer Uitbreiden

De component krijgt twee secties:

```text
+----------------------------------------------------+
|  Tile Kleuren                                      |
|  Pas de kleuren aan van je dashboard tiles.        |
|----------------------------------------------------|
|                                                    |
|  ▸ BESPAARD DEZE MAAND                             |
|  Preview: [Mini tile met beige/bruin]              |
|  Achtergrond: [🎨] [#f2eadc] [██]                  |
|  Tekst:       [🎨] [#412700] [██]                  |
|  [↺ Reset naar standaard]                          |
|                                                    |
|  ▸ OVERIGE TILES                                   |
|  Preview: [Mini tile met groen]                    |
|  Achtergrond: [🎨] [#cfddd0] [██]                  |
|  Tekst:       [🎨] [#002C1F] [██]                  |
|  [↺ Reset naar standaard]                          |
+----------------------------------------------------+
```

Nieuwe props:
```typescript
interface TileColorCustomizerProps {
  colors: TileColors;                    // Overige tiles
  savedHoursColors: TileColors;          // Bespaard tile
  onUpdate: (...) => Promise<void>;
  onUpdateSavedHours: (...) => Promise<void>;
  onReset: () => Promise<void>;
  onResetSavedHours: () => Promise<void>;
}
```

### 3. SavedHoursTile Aanpassen

De component krijgt een aparte default:
```typescript
const DEFAULT_SAVED_HOURS_COLORS: TileColors = {
  background: '#f2eadc',
  text: '#412700',
};

interface SavedHoursTileProps {
  workflowNames: string[];
  tileColors?: TileColors;  // Nu specifiek voor deze tile
}
```

### 4. TileOrganizer Preview Aanpassen

De drag-and-drop preview toont de "saved-hours" tile met zijn eigen kleuren:
- Saved-hours tile: gebruikt `savedHoursColors`
- Andere tiles: gebruiken `tileColors`

### 5. Index.tsx Aanpassen

```typescript
// In Index component
const savedHoursColors = dashboardSettings.saved_hours_colors || {
  background: '#f2eadc',
  text: '#412700',
};

// Bij renderen SavedHoursTile
<SavedHoursTile 
  workflowNames={connectedWorkflowNames} 
  tileColors={savedHoursColors}  // Nu aparte kleuren
/>
```

---

## Visueel Resultaat

Na implementatie:

**Dashboard:**
```text
+------------------+------------------+------------------+
| 🕐 Bespaard      | 📅 Planning      | 📄 Blog          |
| deze maand       | (groen)          | (groen)          |
| (beige/bruin)    |                  |                  |
+------------------+------------------+------------------+
| 🖼 Alt Text      | 💬 Chatbot       | ✨ Copyright     |
| (groen)          | (groen)          | (groen)          |
+------------------+------------------+------------------+
```

**Admin Panel - Tile Kleuren:**
- Twee visueel gescheiden secties
- Elk met eigen preview, kleurpickers en reset knop
- "Bespaard deze maand" bovenaan voor prominentie

