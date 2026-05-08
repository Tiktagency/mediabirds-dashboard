
# Plan: Dashboard Tile Kleuren Aanpasbaar Maken

## Overzicht

Twee nieuwe kleuren toevoegen aan de dashboard instellingen die de admin kan aanpassen:

| Kleur | Standaard waarde | Beschrijving |
|-------|------------------|--------------|
| Tile Achtergrond | `#cfddd0` | De achtergrondkleur van dashboard tiles (sage groen) |
| Tile Tekst | `#002C1F` | De tekstkleur binnen de dashboard tiles (donker groen) |

---

## Wat wordt aangepast

### Bestanden die aangepast worden:

1. **`src/hooks/useDashboardSettings.ts`** - Nieuwe kleuren toevoegen aan de interface en defaults
2. **`src/components/admin/dashboard/TileColorCustomizer.tsx`** - Nieuw component voor het aanpassen van tile kleuren
3. **`src/components/admin/dashboard/DashboardTab.tsx`** - Het nieuwe component toevoegen
4. **`src/components/dashboard/DashboardButton.tsx`** - Dynamische kleuren ontvangen en toepassen
5. **`src/components/dashboard/SavedHoursTile.tsx`** - Dynamische kleuren ontvangen en toepassen
6. **`src/components/dashboard/AutomationInfoTooltip.tsx`** - Dynamische tekstkleur toepassen
7. **`src/components/admin/dashboard/TileOrganizer.tsx`** - Preview met dynamische kleuren
8. **`src/pages/Index.tsx`** - Kleuren doorgeven aan dashboard componenten

---

## Technische Details

### 1. Interface en Hook Uitbreiden

```typescript
// useDashboardSettings.ts
export interface DashboardSettings {
  // ... bestaande velden
  tile_colors: {
    background: string;  // Standaard: #cfddd0
    text: string;        // Standaard: #002C1F
  };
}

const DEFAULT_SETTINGS = {
  // ... bestaande defaults
  tile_colors: {
    background: '#cfddd0',
    text: '#002C1F',
  },
};
```

Nieuwe functie toevoegen:
```typescript
const updateTileColors = async (colors: { background?: string; text?: string }) => {
  const newColors = { ...settings?.tile_colors, ...colors };
  await updateSettings({ tile_colors: newColors });
};
```

### 2. Nieuw TileColorCustomizer Component

Vergelijkbaar met de bestaande `ColorCustomizer` maar specifiek voor tile kleuren:

```text
+----------------------------------------------+
|  Tile Kleuren                                |
|  Pas de kleuren aan van je dashboard tiles.  |
|----------------------------------------------|
|  Achtergrond                                 |
|  [🎨] [#cfddd0    ] [████ Preview]           |
|                                              |
|  Tekst                                       |
|  [🎨] [#002C1F    ] [████ Preview]           |
+----------------------------------------------+
```

Preview toont een mini tile met de geselecteerde kleuren zodat de admin direct ziet hoe het eruit komt te zien.

### 3. Dashboard Componenten Dynamisch Maken

**DashboardButton.tsx:**
- Nieuwe prop: `tileColors?: { background: string; text: string }`
- Vervang hardcoded `text-[#002C1F]` met inline style of dynamische class
- CSS variabelen of inline styles voor achtergrond

**SavedHoursTile.tsx:**
- Nieuwe props: `tileColors?: { background: string; text: string }`
- Vervang `bg-white` met dynamische achtergrond
- Vervang `text-[#002C1F]` met dynamische tekstkleur

**AutomationInfoTooltip.tsx:**
- Nieuwe prop: `textColor?: string`
- Pas info icoon kleur dynamisch aan

### 4. Index.tsx Aanpassingen

Haal `tile_colors` op uit `useDashboardSettings` en geef deze door aan alle dashboard componenten:

```tsx
const { settings } = useDashboardSettings();

<DashboardButton 
  tileColors={settings.tile_colors}
  // ... andere props
/>

<SavedHoursTile 
  tileColors={settings.tile_colors}
  workflowNames={...}
/>
```

### 5. Admin Panel Preview

De `TileOrganizer` component krijgt ook de `tile_colors` als prop zodat de preview in het admin panel direct de gekozen kleuren toont.

---

## Database

De `user_dashboard_settings` tabel heeft al een `dashboard_colors` JSONB kolom die we kunnen gebruiken, of we kunnen de `tile_colors` direct als nieuwe property in de bestaande data opslaan. De hook zorgt voor backwards compatibility met een default waarde.

---

## Resultaat

Na implementatie kan de admin in het Dashboard tabblad van het Admin Panel:
1. De achtergrondkleur van alle tiles aanpassen
2. De tekstkleur binnen alle tiles aanpassen
3. Direct een preview zien van de gekozen kleuren
4. De wijzigingen worden automatisch opgeslagen en toegepast op het hele dashboard
