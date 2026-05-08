
## Responsive layout + tooltip z-index fix

### Problemen

1. **Niet responsive**: Op mobiel stapelen de kolommen al (flex-col), maar de padding, spacing en het animatiepaneel zijn niet geoptimaliseerd voor kleine schermen.
2. **Tooltip overlapt met achtergrond**: De TooltipContent bij "Pagina url" heeft geen hoge z-index, waardoor het achter andere elementen verdwijnt.

### Oplossing

**Bestand: `src/pages/Landingspagina.tsx`**

**1. Tooltip z-index fixen (regel 276)**
Voeg `z-50` toe aan de TooltipContent van Pagina url (en voor consistentie ook bij Applicatie wachtwoord op regel 219):

```
// Was:
<TooltipContent side="top" className="max-w-xs bg-card border-border text-white p-3">

// Wordt:
<TooltipContent side="top" className="z-50 max-w-xs bg-card border-border text-white p-3">
```

Doe hetzelfde voor de Applicatie wachtwoord tooltip (regel 219):
```
<TooltipContent side="top" className="z-50 max-w-xs bg-card border-border text-white p-4">
```

**2. Responsive aanpassingen**

| Element | Regel | Wijziging |
|---|---|---|
| Header bar | 170 | `top-6 left-6 right-6` naar `top-4 left-4 right-4 sm:top-6 sm:left-6 sm:right-6` |
| Main container | 179 | `pt-20 px-6` naar `pt-16 px-4 sm:pt-20 sm:px-6` |
| Titel | 180 | Voeg `text-2xl sm:text-4xl` toe (kleinere titel op mobiel) |
| Beschrijving | 181 | Voeg `text-sm sm:text-base` toe |
| Max-width wrapper | 186, 198 | `max-w-2xl` blijft (werkt goed op alle schermen) |
| Flex gap | 199 | `gap-4` naar `gap-3 sm:gap-4` |
| Animatiepaneel | 301 | `lg:w-72` naar `hidden lg:flex lg:w-72` -- verberg op mobiel (neemt te veel ruimte in) |
| Start button | 288 | `py-3` naar `py-2 sm:py-3` |

### Technische details

Alle wijzigingen in een enkel bestand: `src/pages/Landingspagina.tsx`. Geen nieuwe dependencies of database wijzigingen nodig.
