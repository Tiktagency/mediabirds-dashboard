
## Verleng de wachttijd voor nieuwsbrief generatie

Het probleem: Supabase Edge Functions hebben een standaard CPU-tijdlimiet. De `fetch` naar n8n heeft geen expliciete timeout, waardoor de verbinding kan worden verbroken vóór de 3 minuten voorbij zijn.

### Twee wijzigingen

**1. `supabase/functions/trigger-newsletter-webhook/index.ts`**

Voeg een `AbortController` toe met 4 minuten (240 seconden) timeout op de fetch naar n8n:

```ts
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 240_000); // 4 minuten

const webhookResponse = await fetch(NEWSLETTER_WEBHOOK_URL, {
  method: 'POST',
  signal: controller.signal,
  headers: { ... },
  body: JSON.stringify(payload),
});
clearTimeout(timeoutId);
```

Voeg ook een betere foutmelding toe als de AbortError getriggerd wordt.

**2. `supabase/config.toml`**

Verhoog de `max_duration` voor de newsletter edge function naar 300 seconden (5 minuten):

```toml
[functions.trigger-newsletter-webhook]
max_duration = 300
```

Dit zijn de enige twee bestanden die wijzigen.
