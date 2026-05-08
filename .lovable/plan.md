

## Webhook timeout verhogen naar 10 minuten

### Probleem
De `fetch()` aanroep naar de webhook heeft geen expliciete timeout ingesteld, waardoor de browser na zijn standaard timeout (meestal ~30-60 seconden) de verbinding verbreekt met een "Failed to fetch" fout, terwijl de webhook nog bezig is.

### Oplossing
Een `AbortController` met een timeout van 10 minuten (600.000 ms) toevoegen aan de `fetch()` aanroep.

### Technische wijzigingen

**Bestand: `src/components/seo-blog/PageUrlForm.tsx`**

Bij de `fetch()` call (rond regel 170) een `AbortController` toevoegen met een `signal` en een `setTimeout` van 600.000 ms:

```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 600000); // 10 minuten

const response = await fetch(WEBHOOK_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(payload),
  signal: controller.signal,
});

clearTimeout(timeoutId);
```

In het `catch`-blok wordt een specifieke foutmelding getoond wanneer de timeout wel wordt bereikt (na 10 minuten):

```typescript
} catch (error) {
  const isTimeout = error instanceof DOMException && error.name === 'AbortError';
  const catchMsg = isTimeout
    ? `[${companyName}] Timeout: geen antwoord ontvangen na 10 minuten`
    : `[${companyName}] Fout bij documentatie: ${error instanceof Error ? error.message : String(error)}`;
  // ...
}
```
