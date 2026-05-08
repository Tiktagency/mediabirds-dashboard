

## "Opslaan" knop toevoegen aan Knopkleuren en Achtergrondkleur

### Wat verandert er

Beide componenten krijgen lokale state zodat kleurwijzigingen alleen in de preview zichtbaar zijn. Pas bij klikken op "Opslaan" worden de kleuren daadwerkelijk opgeslagen en toegepast op de hele applicatie.

### Technische aanpassingen

**`src/components/admin/dashboard/ButtonColorCustomizer.tsx`**
- Lokale state `localColors` toevoegen (geinitialiseerd met huidige `colors` prop)
- Color inputs wijzigen naar `localColors` in plaats van direct `onUpdate` aan te roepen
- Preview toont `localColors`
- "Opslaan" knop naast "Reset" die `onUpdate(localColors)` aanroept
- Reset knop reset ook de lokale state
- `useEffect` om `localColors` te synchroniseren als `colors` prop van buitenaf verandert

**`src/components/admin/dashboard/BackgroundColorCustomizer.tsx`**
- Lokale state `localColor` toevoegen (geinitialiseerd met huidige `color` prop)
- Color inputs wijzigen naar `localColor`
- Preview toont `localColor`
- "Opslaan" knop naast "Reset" die `onUpdate(localColor)` aanroept
- Reset knop reset ook de lokale state
- `useEffect` om `localColor` te synchroniseren als `color` prop verandert

**Layout van de knoppen (beide componenten)**
- De huidige enkele "Reset" knop wordt vervangen door een flex-row met twee knoppen naast elkaar:
  - Links: "Reset" (outline variant, zoals nu)
  - Rechts: "Opslaan" (default/primary variant)

### Bestanden die worden aangepast

| Bestand | Actie |
|---|---|
| `src/components/admin/dashboard/ButtonColorCustomizer.tsx` | Lokale state + Opslaan knop |
| `src/components/admin/dashboard/BackgroundColorCustomizer.tsx` | Lokale state + Opslaan knop |

