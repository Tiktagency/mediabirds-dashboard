

## Responsive maken voor grote schermen

### Probleem

Alle pagina's gebruiken vaste `max-w-4xl`, `max-w-5xl` of `max-w-lg` containers, waardoor er op grote schermen (1440px+, 1920px+) veel lege ruimte aan de zijkanten overblijft. De content ziet er "klein" uit op een groot monitor.

### Aanpak

De containers worden opgeschaald met responsive breakpoints zodat ze op grotere schermen meer ruimte benutten, terwijl ze op standaard schermen hetzelfde blijven.

### Wijzigingen per pagina/bestand

| Bestand | Huidige beperking | Nieuwe aanpak |
|---|---|---|
| `src/pages/Index.tsx` | `max-w-5xl` wrapper + `max-w-4xl` grid, 3-kolom grid | Upgrade naar `max-w-5xl 2xl:max-w-7xl`, grid `md:grid-cols-3 2xl:grid-cols-3` met grotere tiles |
| `src/pages/SeoBlog.tsx` | `max-w-5xl` + `max-w-4xl` + `max-w-2xl` secties | Upgrade naar `max-w-5xl 2xl:max-w-7xl`, arrow tiles en formulieren breder op grote schermen |
| `src/pages/Landingspagina.tsx` | `max-w-2xl` | Upgrade naar `max-w-2xl xl:max-w-4xl 2xl:max-w-5xl` |
| `src/pages/WordpressAltText.tsx` | `max-w-2xl` | Upgrade naar `max-w-2xl xl:max-w-4xl 2xl:max-w-5xl` |
| `src/pages/LeadsGenerator.tsx` | `max-w-lg` | Upgrade naar `max-w-lg xl:max-w-xl 2xl:max-w-2xl` |
| `src/pages/MondayPlanning.tsx` | `max-w-xl` | Upgrade naar `max-w-xl xl:max-w-2xl` |
| `src/pages/CopyrightBranding.tsx` | Geen max-w op wrapper, maar form component heeft `max-w-4xl` | Upgrade form wrapper naar `max-w-4xl 2xl:max-w-6xl` |
| `src/pages/EmailSignature.tsx` | `max-w-7xl` | Al goed, eventueel `2xl:max-w-[1600px]` |
| `src/pages/AdminPanel.tsx` | `max-w-6xl` | Upgrade naar `max-w-6xl 2xl:max-w-7xl` |
| `src/pages/Chatbot.tsx` | Volledige breedte iframe | Al goed |
| `src/pages/Login.tsx` | `max-w-md` gecentreerd | Prima zo, login hoeft niet breder |
| `tailwind.config.ts` | Geen `3xl` breakpoint | Optioneel `3xl: 1920px` breakpoint toevoegen |

### Technisch detail

**1. Tailwind config - extra breakpoint toevoegen**

Een `3xl` breakpoint op 1920px toevoegen aan de theme.extend.screens sectie, zodat we ook ultrawide schermen kunnen targeten.

**2. Dashboard (Index.tsx)**

- Wrapper: `max-w-5xl` wordt `max-w-5xl 2xl:max-w-7xl`
- Grid: `max-w-4xl` wordt `max-w-4xl 2xl:max-w-6xl`
- Banner hoogte: `h-48` wordt `h-48 2xl:h-64` voor betere verhoudingen
- Grid tiles blijven 3 kolommen maar worden groter door de bredere container

**3. SEO Blog (SeoBlog.tsx)**

- Hoofd-wrapper: `max-w-5xl` wordt `max-w-5xl 2xl:max-w-7xl`
- Title/notes sectie: `max-w-4xl` wordt `max-w-4xl 2xl:max-w-6xl`
- Arrow tiles: `max-w-4xl` wordt `max-w-4xl 2xl:max-w-6xl`
- Form area: `max-w-2xl` wordt `max-w-2xl xl:max-w-3xl 2xl:max-w-4xl`

**4. Landingspagina & WordPress Alt Text**

- Content containers: `max-w-2xl` wordt `max-w-2xl xl:max-w-4xl 2xl:max-w-5xl`
- De twee-kolom layout (form + animatie) schaalt mee

**5. Leads Generator & Monday Planning**

- Kleinere forms, opschaling naar een comfortabele breedte zonder de UI uit te rekken

**6. Admin Panel**

- `max-w-6xl` wordt `max-w-6xl 2xl:max-w-7xl`

### Bestanden

| Bestand | Actie |
|---|---|
| `tailwind.config.ts` | `3xl` breakpoint toevoegen |
| `src/pages/Index.tsx` | Container en grid max-widths opschalen |
| `src/pages/SeoBlog.tsx` | Alle max-w containers opschalen |
| `src/pages/Landingspagina.tsx` | Content container opschalen |
| `src/pages/WordpressAltText.tsx` | Content container opschalen |
| `src/pages/LeadsGenerator.tsx` | Form container opschalen |
| `src/pages/MondayPlanning.tsx` | Form container opschalen |
| `src/pages/CopyrightBranding.tsx` | Wrapper opschalen |
| `src/pages/EmailSignature.tsx` | Container licht opschalen |
| `src/pages/AdminPanel.tsx` | Container opschalen |

