

## Nieuwe dashboard tile: "Landingspagina"

### Wat verandert er
Er wordt een nieuwe tile "Landingspagina" toegevoegd aan het dashboard. Deze tile volgt exact hetzelfde patroon als de bestaande tiles (zoals "Copyright Branding" en "Email Handtekening").

### Wijzigingen per bestand

**1. Nieuwe pagina: `src/pages/Landingspagina.tsx`**
- Lege placeholder pagina aanmaken met een titel en terugknop, in dezelfde stijl als de andere pagina's.

**2. `src/App.tsx`**
- Nieuwe route `/landingspagina` toevoegen.

**3. `src/pages/Index.tsx`**
- Entry toevoegen aan `tileConfigMap`:
  ```
  'landingspagina': {
    to: '/landingspagina',
    icon: FileText (of ander passend icoon),
    variant: 'primary',
    statusKey: 'landingspagina',
  }
  ```

**4. `src/components/admin/dashboard/TileOrganizer.tsx`**
- Entry toevoegen aan `tileConfig`:
  ```
  'landingspagina': { icon: FileText, variant: 'primary' }
  ```

**5. `src/hooks/useDashboardSettings.ts`**
- `'landingspagina'` toevoegen aan de `DEFAULT_SETTINGS.tile_order` array.

**6. Database: `automation_settings` tabel**
- Nieuw record invoegen met `automation_name: 'landingspagina'` en `display_name: 'Landingspagina'` zodat de tile correct wordt weergegeven op het dashboard en in het admin panel.

### Resultaat
Na deze wijzigingen verschijnt de "Landingspagina" tile op het dashboard (standaard op de 8e positie), is hij versleepbaar in de Tile Organizer, en navigeert hij naar een eigen pagina.
