
## Analyse: Nieuwsbrief vs. EmailSignature

### Verschillen (alle punten)

| Element | EmailSignature | Nieuwsbrief | Probleem |
|---|---|---|---|
| Achtergrond | `hero-gradient` (donkere radiaal verloop) | `bg-background` (plat donker) | Inconsistent |
| Dashboard knop | `absolute top-6 left-6` — witte outline knop "Dashboard" | Sticky header met "Terug" ArrowLeft tekst-link | Ontbreekt + verkeerde stijl |
| Paginatitel | `hero-title` grote font, wit, gecentreerd | Geen paginatitel buiten header | Ontbreekt |
| Subtitel | Kleine beschrijvingstekst wit/50, gecentreerd | Geen | Ontbreekt |
| Content container | `max-w-7xl` gecentreerd met `pt-8 pb-16 px-6` | Full-bleed split layout, geen centering | Inconsistent |
| Kaartkleur | `bg-white/5 border-white/10` | `bg-card/50`, `bg-muted/10`, `bg-card/30` | Inconsistent |
| Header/nav | Geen sticky header | Sticky header bar | Overbodig/verkeerd patroon |
| Formulier container | Cards (EmailSignatureForm gebruikt `Card`) | Losse velden in scrollable div | Inconsistent |

### Plan

De Nieuwsbrief pagina refactoren naar het EmailSignature patroon:

1. **Achtergrond**: `bg-background` → `hero-gradient`
2. **Dashboard knop**: sticky header verwijderen, `absolute top-6 left-6` knop toevoegen met `Link to="/"` en `Button variant="outline"` stijl `bg-white/5 border-white/20 text-white hover:bg-white/10`
3. **Paginatitel + subtitel**: `hero-title` "Nieuwsbrief" + subtitel toevoegen (gecentreerd, `text-white/50`)
4. **Content wrapper**: `w-full flex flex-col items-center pt-8 pb-16 px-6` met `max-w-7xl` container
5. **Layout**: twee kolommen behouden maar als `grid grid-cols-1 md:grid-cols-[400px_1fr]` binnen de gecentreerde container (vergelijkbaar met EmailSignature's grid)
6. **Kaartkleur linkerkolom**: formuliervelden wrappen in een `Card` met `bg-white/5 border-white/10` (zoals EmailSignatureForm)
7. **Preview kolom**: Card met `bg-white/5 border-white/10` + `CardHeader` met "HTML Preview" titel en Downloaden knop — zoals de Preview card in EmailSignature
8. **Labels**: `text-white/50` in plaats van `text-muted-foreground` (consistent met EmailSignature stijl)
9. **Import**: `useNavigate` → `Link` van react-router-dom

### Bestanden

| Bestand | Aanpassing |
|---|---|
| `src/pages/Nieuwsbrief.tsx` | Volledig refactoren naar EmailSignature layout-patroon |
