## Doel

Voor elke actieknop in het dashboard die een webhook triggert moet de "laden"-staat alleen verdwijnen wanneer n8n daadwerkelijk een response (bericht) heeft teruggestuurd op het POST-verzoek. Geen vroege fallbacks, geen verborgen 60s-timeouts die de knop stoppen voordat n8n klaar is.

## Hoe het nu werkt vs. probleem

Alle handlers gebruiken `try/finally setIsLoading(false)` rond een `await`, dus formeel wachten ze al op de response. Het probleem zit in de **edge functions zonder lange timeout**: de Deno-runtime/n8n call wordt na ~60 s afgebroken terwijl n8n nog bezig is, waarna de knop stopt met laden zonder echt bericht. Daarnaast moet ook in de frontend gegarandeerd worden dat geen enkel pad de loader vroeger uitzet.

Edge functions zonder lange `AbortController` timeout (huidig probleem):
- `trigger-alt-text-webhook`
- `trigger-landing-webhook`
- `trigger-email-signature`

Edge functions die het al goed doen (referentie):
- `trigger-leads-webhook` (300 s), `trigger-newsletter-webhook` (240 s), `trigger-seo-webhook` (180 s), `trigger-blog-generation` (240 s)

## Wijzigingen

### 1. Edge functions: lange timeout + altijd wachten op n8n body

Voeg in `trigger-alt-text-webhook`, `trigger-landing-webhook` en `trigger-email-signature` toe:
- `AbortController` met `setTimeout(..., 300_000)` (5 min, ruime marge boven n8n workflow-tijd)
- `signal: controller.signal` op de `fetch` naar n8n
- `clearTimeout(timeoutId)` in `finally`
- Aparte response wanneer abort optreedt: `status 504` met `{ success: false, error: 'Timeout: webhook gaf geen antwoord binnen 5 minuten' }` zodat frontend een duidelijke fout toont (knop stopt dan met laden ná échte timeout, niet vroeger)
- Pas daarna pas response naar de browser sturen (zoals `trigger-leads-webhook` al doet)

### 2. Frontend handlers: garandeer dat loader alleen stopt na response

Audit en fix waar nodig:

| Bestand | Status |
|---|---|
| `src/pages/MondayPlanning.tsx` | OK — al `await fetch` + `finally` |
| `src/pages/Nieuwsbrief.tsx` | OK — synchronous invoke |
| `src/pages/LeadsGenerator.tsx` | OK — wacht op invoke; 1s vertraging is alleen UX-fade |
| `src/pages/Landingspagina.tsx` | OK frontend; edge function-timeout aanpassen |
| `src/pages/WordpressAltText.tsx` | OK frontend; edge function-timeout aanpassen |
| `src/components/seo-blog/BlogGenerationForm.tsx` | OK |
| `src/components/seo-blog/KeywordResearchForm.tsx` | OK |
| `src/components/seo-blog/PageUrlForm.tsx` | OK (heeft al 600s `AbortController` in de browser) |
| `src/components/email-signature/EmailSignatureForm.tsx` | OK frontend; edge function-timeout aanpassen |

Frontend-aanpassing per handler: verifieer dat:
- Er geen `setTimeout` of optimistische `setIsLoading(false)` vóór de `await` staat.
- De loader-state alleen wordt teruggezet in `finally` ná de awaited call.
- Bij validatiefouten (vóór de fetch) blijft `setIsLoading(false)` direct toegestaan — dit is geen webhook-call.

Geen functionele uitbreidingen of nieuwe knoppen — alleen het loading-gedrag wordt geharmoniseerd.

### 3. Memory update

Update `mem://features/automation/webhook-loading-state` (of toevoegen aan bestaande webhook-memory): "Actieknoppen tonen loader tot synchrone n8n response binnen is. Edge functions hebben minimaal 300 s `AbortController` timeout. Geen vroege loader-reset toegestaan."

## Technische details

```ts
// Voorbeeld toe te voegen in elke trigger-edge function zonder timeout
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 300_000);
let webhookResponse: Response;
try {
  webhookResponse = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', /* auth */ },
    body: JSON.stringify(payload),
    signal: controller.signal,
  });
} catch (e) {
  clearTimeout(timeoutId);
  if ((e as any).name === 'AbortError') {
    return new Response(
      JSON.stringify({ success: false, error: 'Timeout: webhook gaf geen antwoord binnen 5 minuten' }),
      { status: 504, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  throw e;
}
clearTimeout(timeoutId);
const responseText = await webhookResponse.text();
return new Response(
  JSON.stringify({ success: webhookResponse.ok, data: responseText, status: webhookResponse.status }),
  { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
);
```

## Bestanden die wijzigen

- `supabase/functions/trigger-alt-text-webhook/index.ts`
- `supabase/functions/trigger-landing-webhook/index.ts`
- `supabase/functions/trigger-email-signature/index.ts`
- `mem://features/automation/webhook-loading-state` (nieuw of update)
- `mem://index.md` (referentie toevoegen)

## Niet in scope

- Andere UI-veranderingen
- Wijzigingen in de n8n-workflows zelf
- Asynchrone callback-architectuur (gebruiker koos expliciet voor synchroon wachten)
