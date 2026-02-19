

## Progressiebalk + webhook timeout + pop-up melding

### Wat wordt er gedaan

1. **Progressiebalk**: Zodra je op "Start" klikt verschijnt er een geanimeerde voortgangsbalk tussen de subtitel en het formulierblok. Deze loopt op van 0% naar 100% over maximaal 5 minuten (300 seconden).
2. **Timeout van 5 minuten**: De webhook-aanroep krijgt een maximale wachttijd van 5 minuten. Als er geen antwoord komt binnen die tijd, stopt de balk en verschijnt een foutmelding.
3. **Pop-up melding**: Het antwoord van de webhook wordt 5 seconden als toast-notificatie getoond (in plaats van de huidige 3 seconden standaard).

### Technische details

**`src/pages/LeadsGenerator.tsx`**

Nieuwe state variabelen:
- `progress` (number, 0-100) -- bijhoudt hoever de balk is
- `isRunning` (boolean) -- of de webhook actief draait

Wanneer "Start" wordt geklikt:
1. `isRunning` wordt `true`, `progress` wordt `0`
2. Een `setInterval` start die elke seconde `progress` verhoogt met `100/300` (= 0.333% per seconde, 100% na 5 min)
3. De `supabase.functions.invoke` call wordt gestart
4. Zodra het antwoord binnenkomt: interval stoppen, `progress` naar 100%, kort wachten, dan resetten
5. Als er na 5 minuten geen antwoord is: `AbortController` annuleert de request, foutmelding wordt getoond
6. Toast melding toont het webhook-antwoord met een `duration` van 5000ms

De progressiebalk wordt geplaatst tussen de `<p>` subtitel en de `<div className="w-full max-w-lg">` container, met dezelfde max-width (`max-w-lg`).

Component gebruikt: `Progress` uit `@/components/ui/progress` (al aanwezig in het project).

**`supabase/functions/trigger-leads-webhook/index.ts`**

Een `AbortController` met timeout van 5 minuten wordt toegevoegd aan de `fetch` call naar de n8n webhook, zodat de edge function niet eindeloos blijft hangen.

### Visueel gedrag

```text
[Titel + subtitel]
[===== Progressiebalk (alleen zichtbaar tijdens laden) =====]
[Formulierblok]
[Start knop]
```

- Balk verschijnt alleen wanneer de webhook draait
- Balk loopt geleidelijk op (lineair over 5 min)
- Bij antwoord: balk springt naar 100%, verdwijnt na 1 seconde
- Pop-up melding verschijnt 5 seconden met het webhook-antwoord

### Bestanden die worden aangepast

| Bestand | Actie |
|---|---|
| `src/pages/LeadsGenerator.tsx` | Progress state, interval timer, AbortController timeout, toast met 5s duration |
| `supabase/functions/trigger-leads-webhook/index.ts` | Timeout van 5 min toevoegen aan fetch call |
