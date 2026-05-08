

## Fix: content verdwijnt wanneer automatische trigger uitklapt

### Probleem

De buitenste container heeft `h-screen overflow-hidden` en de binnenste scrollbare div heeft `overflow-y-auto`, maar er is geen padding aan de onderkant. Wanneer de ScheduleTrigger uitklapt, groeit de inhoud voorbij het scherm en wordt de onderkant afgesneden zonder dat je kunt scrollen naar de Start-knop en onderste velden.

### Oplossing

**Bestand: `src/pages/Landingspagina.tsx`**

1. **Padding-bottom toevoegen aan de scrollbare container (regel 179)**
   - Voeg `pb-8` toe aan de hero-gradient div, zodat er ruimte is onder de laatste content en de gebruiker kan scrollen naar de Start-knop.

2. **`overflow-hidden` op de buitenste div behouden** -- dit voorkomt dat de hele pagina scrollt buiten de hero. De binnenste div met `overflow-y-auto` handelt het scrollen correct af zodra er genoeg bottom-padding is.

### Technische details

| Regel | Was | Wordt |
|---|---|---|
| 179 | `...justify-start pt-16 px-4 sm:pt-20 sm:px-6 overflow-y-auto` | `...justify-start pt-16 px-4 sm:pt-20 sm:px-6 pb-8 overflow-y-auto` |

Dat is de enige wijziging. De `pb-8` zorgt ervoor dat de scroll-container genoeg ruimte heeft onderaan om de Start-knop en alle velden zichtbaar te maken, ook wanneer de automatische trigger is uitgeklapt.

