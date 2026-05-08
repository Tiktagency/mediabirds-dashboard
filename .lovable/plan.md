
## Scrollbalk doorlopen + dropdown iets naar links

### Wat verandert er

1. De scrollbalk loopt tot aan de bovenkant van de pagina (zoals bij `/seo-blog`)
2. De bedrijven-dropdown verschuift iets naar links

### Technische aanpassing

**Bestand: `src/pages/Landingspagina.tsx`**

**Buitenste container (regel 187)**: Verander `h-screen overflow-hidden relative` naar `min-h-screen relative` -- dit laat de scrollbar over de hele pagina lopen i.p.v. alleen in een nested div.

**Content container (regel 197)**: Verander `h-full ... overflow-y-auto` naar `min-h-screen` (zonder overflow-y-auto, want de buitenste container scrollt nu).

**Dropdown knop (regel 194)**: Wrap de `LandingCompanySelector` in een div met `pr-2` om hem iets naar links te schuiven, of voeg `mr-2` toe aan de selector.

| Regel | Was | Wordt |
|---|---|---|
| 187 | `h-screen overflow-hidden relative` | `min-h-screen relative` |
| 197 | `hero-gradient h-full w-full ... overflow-y-auto` | `hero-gradient min-h-screen w-full ... ` (zonder overflow-y-auto) |
| 194 | `<LandingCompanySelector .../>` | `<div className="mr-2"><LandingCompanySelector .../></div>` |

Dit maakt de scroll-ervaring identiek aan de SEO Blog pagina.
