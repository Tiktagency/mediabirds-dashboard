

## Achtergrondkleur customizer + reset knop hernoemen

### Wat wordt er gedaan

1. **Nieuwe component: `BackgroundColorCustomizer`** -- Zelfde opzet als `ButtonColorCustomizer`, met een kleurenkiezer voor de achtergrondkleur van alle pagina's en een "Reset" knop.

2. **Achtergrondkleur opslaan in `dashboard_colors`** -- Nieuw veld `background_color` (type `string`, standaard `#0d0d0d`) wordt opgeslagen in de bestaande `dashboard_colors` JSONB kolom, net als bij button_colors. Geen database migratie nodig.

3. **Hook: `useApplyButtonColors` uitbreiden** -- De bestaande hook wordt uitgebreid (en hernoemd naar `useApplyCustomColors` of blijft hetzelfde) om ook de achtergrondkleur toe te passen via `document.documentElement.style.setProperty` op de `--background` CSS variabele.

4. **Reset knop bij Knopkleuren hernoemen** -- De tekst "Reset naar standaard" wordt gewijzigd naar "Reset".

5. **DashboardTab aanpassen** -- De nieuwe `BackgroundColorCustomizer` wordt onderaan de pagina toegevoegd.

### Technische details

**Nieuw bestand: `src/components/admin/dashboard/BackgroundColorCustomizer.tsx`**
- Zelfde structuur als `ButtonColorCustomizer`
- Preview: een klein vierkant met de gekozen achtergrondkleur
- Twee velden: achtergrondkleur (color picker + hex input)
- Reset knop met standaardwaarde `#0d0d0d`

**`src/hooks/useDashboardSettings.ts`**
- Toevoegen: `background_color: string` aan het `DashboardSettings` interface
- Default: `#0d0d0d`
- Nieuwe functie `updateBackgroundColor` die opslaat in `dashboard_colors.background_color`
- Uitlezen uit `dashboardColors?.background_color`

**`src/hooks/useApplyButtonColors.ts`**
- Naast button colors ook `settings?.background_color` uitlezen
- Omzetten van hex naar HSL en toepassen op `--background` CSS variabele (zowel `:root` als `.dark`)

**`src/components/admin/dashboard/ButtonColorCustomizer.tsx`**
- Regel 95: "Reset naar standaard" wordt "Reset"

**`src/components/admin/dashboard/DashboardTab.tsx`**
- Import en render van `BackgroundColorCustomizer` onderaan, na de bestaande grid secties

### Bestanden die worden aangepast

| Bestand | Actie |
|---|---|
| `src/components/admin/dashboard/BackgroundColorCustomizer.tsx` | Nieuw bestand |
| `src/hooks/useDashboardSettings.ts` | `background_color` toevoegen + update functie |
| `src/hooks/useApplyButtonColors.ts` | Achtergrondkleur toepassen op CSS variabele |
| `src/components/admin/dashboard/ButtonColorCustomizer.tsx` | "Reset naar standaard" -> "Reset" |
| `src/components/admin/dashboard/DashboardTab.tsx` | BackgroundColorCustomizer toevoegen |

