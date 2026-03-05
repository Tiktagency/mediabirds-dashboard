
## Layout aanpassing: Trigger en knop naar linkerkolom

Huidig: Row 2 heeft [Kleuren card | Preview card] en daarna los de ScheduleTrigger + knop full-width.

Gewenst: 
- Linkerkolom: Kleuren card + ScheduleTrigger card + Genereer-knop (gestapeld)
- Rechterkolom: Live kleur preview (strekt zich uit over de volledige hoogte)

### Wijziging in `src/pages/Nieuwsbrief.tsx`

**Regel 525:** `items-start` → `items-stretch` op de grid

**Linkerkolom** (regel 527-604): Kleuren card omhullen in een `flex flex-col gap-4` div samen met ScheduleTrigger + knop.

**Rechterkolom** (regel 606-741): Preview card krijgt `h-full` zodat het meestrekt.

**Regels 744-785**: De losse ScheduleTrigger Card + losse Button verwijderen — ze gaan naar de linkerkolom.

```
<div class="grid cols-2 items-stretch">
  <div class="flex flex-col gap-4">            ← linkerkolom
    [Kleuren card]
    [ScheduleTrigger card]
    [Genereer-knop]
  </div>
  <Card class="h-full">                        ← rechterkolom
    [Live kleur preview]
  </Card>
</div>
```

Enkel bestand: `src/pages/Nieuwsbrief.tsx` (regels 524–785).
