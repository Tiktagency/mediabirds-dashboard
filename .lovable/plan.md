

## Bedrijven dropdown knop normaal uitlijnen

### Probleem

De bedrijven-dropdown knop in de header van de Landingspagina is momenteel gepositioneerd met `absolute` positionering en inconsistente padding/marges. Op de SEO Blog pagina wordt een `fixed` header gebruikt met nette uitlijning en achtergrond-blur.

### Aanpassing

**Bestand: `src/pages/Landingspagina.tsx`**

De header-balk (regel 188) wordt aangepast zodat de styling consistent is met andere pagina's zoals SEO Blog:

| Eigenschap | Was | Wordt |
|---|---|---|
| Positionering | `absolute top-4 left-4 right-4 sm:top-6 sm:left-6 sm:right-6` | `fixed top-0 left-0 right-0 px-6 py-4` |
| Z-index | `z-10` | `z-30` |
| Achtergrond | Geen | `bg-background/80 backdrop-blur-md border-b border-white/10` |

De content-sectie eronder (`pt-16`) blijft ongewijzigd omdat deze al voldoende ruimte biedt voor de vaste header.

Dit zorgt ervoor dat de Dashboard-knop en bedrijven-dropdown netjes naast elkaar staan, consistent met de rest van de applicatie.
