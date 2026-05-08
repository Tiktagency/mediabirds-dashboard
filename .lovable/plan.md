
## Twee problemen oplossen

### Probleem 1: Scrollen werkt niet
De wrapper div heeft `h-screen overflow-hidden` met een inner div die `overflow-y-auto` heeft. Maar de inner div heeft `h-full`, waardoor deze precies de schermhoogte beslaat — inclusief de absolute header. De content klopt niet uit omdat er geen `pb-` (padding-bottom) is onderaan, waardoor de onderkant van de pagina buiten beeld valt.

**Fix**: Verander de buitenste `div` van `h-screen overflow-hidden` naar `min-h-screen` en maak de inner div scrollbaar door `overflow-y-auto` te verplaatsen naar de buitenste container. Of simpeler: verander de wrapper naar `h-screen overflow-y-auto` (één scrollable container) en voeg `pb-12` toe onderaan de content.

Concreet: verander lijn 156:
```tsx
// Van:
<div className="h-screen overflow-hidden relative">
// Naar:
<div className="min-h-screen relative">
```
En de inner div (lijn 166):
```tsx
// Van:
<div className="hero-gradient h-full w-full flex flex-col items-center justify-start pt-32 px-6 overflow-y-auto">
// Naar:
<div className="hero-gradient min-h-screen w-full flex flex-col items-center justify-start pt-32 px-6 pb-12">
```

### Probleem 2: Bedrijven worden soms 2x geactiveerd
De cron job loopt elke 5 minuten. Als de verwerking van alle bedrijven langer dan 5 minuten duurt, start de cron job een tweede instantie terwijl de eerste nog loopt. Beide lezen dezelfde schedule met `next_trigger_at <= now` en verwerken alle bedrijven.

**Fix**: De schedule direct aan het begin "claimen" door `next_trigger_at` vooruit te zetten vóórdat de webhooks worden aangeroepen. Zo ziet een eventuele tweede instantie geen dubbele schedule meer.

In `supabase/functions/run-scheduled-alt-text/index.ts`, direct na het ophalen van de schedule, de `next_trigger_at` en `last_triggered_at` alvast updaten:

```typescript
// Claim de schedule direct zodat een parallelle cron run hem niet ook oppikt
const claimedNextTrigger = calculateNextTrigger(
  schedule.interval_value,
  schedule.interval_unit,
  schedule.next_trigger_at
);

const { error: claimError } = await supabase
  .from('alt_text_schedules')
  .update({
    last_triggered_at: new Date().toISOString(),
    next_trigger_at: claimedNextTrigger.toISOString(),
  })
  .eq('id', schedule.id)
  .eq('next_trigger_at', schedule.next_trigger_at); // optimistic lock

// Als update 0 rows raakt → een andere instantie was eerder, stop dan
```

De `.eq('next_trigger_at', schedule.next_trigger_at)` fungeert als een optimistic lock: als twee instanties tegelijk proberen te updaten, wint er maar één. De verliezende instantie detecteert dit en stopt.

### Bestanden
| Bestand | Aanpassing |
|---|---|
| `src/pages/WordpressAltText.tsx` | Scroll fix: `h-screen overflow-hidden` → `min-h-screen`, inner div `h-full overflow-y-auto` → `min-h-screen pb-12` |
| `supabase/functions/run-scheduled-alt-text/index.ts` | Optimistic lock: claim schedule direct na ophalen om dubbele verwerking te voorkomen |
