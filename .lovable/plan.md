

## Fix: Tooltip tekst boven alle elementen weergeven

### Probleem

De tooltips bij "Applicatie wachtwoord" en "Pagina url" hebben al `z-50`, maar dit is niet hoog genoeg. De `backdrop-blur-sm` op de kaart creëert een nieuwe stacking context waardoor de tooltips er alsnog achter verdwijnen.

### Oplossing

**Bestand: `src/pages/Landingspagina.tsx`**

Verhoog de z-index van beide TooltipContent elementen van `z-50` naar `z-[9999]`:

| Regel | Was | Wordt |
|---|---|---|
| 219 | `className="z-50 max-w-xs bg-card border-border text-white p-4"` | `className="z-[9999] max-w-xs bg-card border-border text-white p-4"` |
| 276 | `className="z-50 max-w-xs bg-card border-border text-white p-3"` | `className="z-[9999] max-w-xs bg-card border-border text-white p-3"` |

Dit garandeert dat de tooltips boven alle andere elementen verschijnen, ongeacht stacking contexts van parent-elementen.

