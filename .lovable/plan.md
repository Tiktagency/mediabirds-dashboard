
# Plan: Knopkleuren Customizer Toevoegen

## Overzicht

Vervang het "Thema" component door een nieuwe "Knopkleuren" customizer waarmee gebruikers de achtergrond- en tekstkleur van knoppen in de applicatie kunnen aanpassen.

---

## Technische Wijzigingen

### 1. Hook uitbreiden (`src/hooks/useDashboardSettings.ts`)

**Nieuwe interface en defaults:**
```typescript
export interface DashboardSettings {
  // ... bestaande velden
  button_colors: TileColors;  // NIEUW
}

const DEFAULT_BUTTON_COLORS: TileColors = {
  background: '#cfddd0',  // Sage green (primary)
  text: '#002C1F',        // Dark green
};
```

**Nieuwe functie toevoegen:**
```typescript
const updateButtonColors = async (colors: { background?: string; text?: string }) => {
  const newColors = { ...settings?.button_colors, ...colors };
  const currentDashboardColors = (settings as any)?.dashboard_colors || {};
  await supabase
    .from('user_dashboard_settings')
    .update({ dashboard_colors: { ...currentDashboardColors, button_colors: newColors } })
    .eq('id', settings?.id);
  setSettings(prev => prev ? { ...prev, button_colors: newColors } : null);
  toast({ title: 'Opgeslagen', description: 'Knopkleuren bijgewerkt' });
};
```

### 2. Nieuw component maken (`src/components/admin/dashboard/ButtonColorCustomizer.tsx`)

Vergelijkbaar met TileColorCustomizer:
- Preview van een knop met huidige kleuren
- Kleurpickers voor achtergrond en tekst
- Reset knop naar standaardwaarden

```typescript
interface ButtonColorCustomizerProps {
  colors: TileColors;
  onUpdate: (colors: { background?: string; text?: string }) => Promise<void>;
  onReset: () => Promise<void>;
}
```

### 3. DashboardTab aanpassen (`src/components/admin/dashboard/DashboardTab.tsx`)

**Verwijderen:**
- ThemeSwitch import
- ThemeSwitch component
- updateTheme uit hook destructuring

**Toevoegen:**
- ButtonColorCustomizer import
- ButtonColorCustomizer component op de plek van ThemeSwitch
- updateButtonColors uit hook destructuring

### 4. ThemeSwitch component behouden (niet verwijderen)

Het bestand `ThemeSwitch.tsx` blijft bestaan voor eventueel toekomstig gebruik, maar wordt niet meer geïmporteerd in DashboardTab.

---

## Bestanden

| Bestand | Actie |
|---------|-------|
| `src/hooks/useDashboardSettings.ts` | `button_colors` + `updateButtonColors` toevoegen |
| `src/components/admin/dashboard/ButtonColorCustomizer.tsx` | Nieuw component aanmaken |
| `src/components/admin/dashboard/DashboardTab.tsx` | ThemeSwitch vervangen door ButtonColorCustomizer |

---

## Opslag

Button colors worden opgeslagen in de bestaande `dashboard_colors` JSONB kolom:
```json
{
  "tile_colors": { "background": "#cfddd0", "text": "#002C1F" },
  "saved_hours_colors": { "background": "#f2eadc", "text": "#412700" },
  "button_colors": { "background": "#cfddd0", "text": "#002C1F" }
}
```

---

## Visueel Resultaat

De tweede rij in het Dashboard tabblad bevat dan:
- **Links**: Knopkleuren customizer (nieuw)
- **Rechts**: Impact Kleuren (bestaand)
