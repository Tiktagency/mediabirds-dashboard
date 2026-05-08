## Plan: Hover-previews bij stijl-opties op /seo-blog

### Doel
Bij elke stijl-optie (Isometric, Cinematic, Brutalist) onder "AI afbeelding" een klein "i"-icoontje tonen. Bij hover verschijnt een tooltip met een voorbeeldafbeelding zodat gebruikers zien hoe de stijl eruitziet.

### Afbeeldingen
- **Isometric flat illustration** → `user-uploads://Schermafbeelding_2026-04-30_om_09.20.15.png` (oranje kiosk illustratie)
- **Cinematic 3D interface render** → `user-uploads://Schermafbeelding_2026-04-30_om_09.21.50.png` (3D robot met dashboards)
- **Brutalist / Raw UI design** → placeholder (gebruiker maakt deze later) — toon voorlopig een nette "Voorbeeld komt binnenkort" tekst in de tooltip

### Implementatie

**1. Assets kopiëren**
Beide uploads kopiëren naar `src/assets/`:
- `src/assets/style-isometric-flat.png`
- `src/assets/style-cinematic-3d.png`

**2. UI-wijziging in `src/components/seo-blog/BlogGenerationForm.tsx`** (regels 713-744)

- Imports toevoegen: `Info` icoon van `lucide-react`, `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider` van `@/components/ui/tooltip`, en de twee preview-afbeeldingen.
- Het `options` array uitbreiden met een `preview` veld (image-import of `null` voor brutalist).
- In elke stijl-knop rechtsboven een klein `Info` icoontje plaatsen (12-14px, `text-white/50 hover:text-white/90`), gewikkeld in een `Tooltip`. Hover op het icoon toont een `TooltipContent` met:
  - Indien `preview` aanwezig: `<img>` (ca. 240x180px, `rounded-md`) met daaronder een klein label.
  - Indien `null` (brutalist): tekst "Voorbeeld komt binnenkort".
- Klik op het icoon mag NIET de stijlselectie triggeren → `e.stopPropagation()` + `e.preventDefault()` op de tooltip-trigger.
- `TooltipProvider` toevoegen rondom de stijl-grid (of hergebruiken indien al aanwezig hoger in de boom).

**3. Styling tooltip**
Standaard `TooltipContent` styling overschrijven met `p-2 bg-[#002C1F]/95 border border-white/20` zodat het past bij de glassmorphism look van de form.

### Bestanden
| Bestand | Wijziging |
|---------|-----------|
| `src/assets/style-isometric-flat.png` | Nieuw (kopie van upload 1) |
| `src/assets/style-cinematic-3d.png` | Nieuw (kopie van upload 2) |
| `src/components/seo-blog/BlogGenerationForm.tsx` | Info-icoon + tooltip met preview per stijl-optie |

### Later
Wanneer je de derde afbeelding (brutalist) hebt gemaakt, upload je deze en vervangen we de placeholder-tekst door het beeld op dezelfde manier.