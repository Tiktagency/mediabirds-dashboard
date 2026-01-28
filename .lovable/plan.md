
# Plan: Webhook Response Altijd Opslaan in Meldingen

## Probleem

De `trigger-seo-webhook` edge function filtert bepaalde webhook responses uit en slaat deze niet op als melding. Berichten zoals "Workflow was started" of "OK" worden overgeslagen. De frontend controleert ook de `hasMessage` flag voordat een toast wordt getoond.

**Gewenst gedrag**: ALLE webhook responses moeten worden opgeslagen in de database en getoond aan de gebruiker.

## Huidige Logica (trigger-seo-webhook)

```typescript
// Filtert berichten uit:
if (data.message && data.message !== 'Workflow was started') {
  // Alleen dan wordt hasActualMessage = true
}

// Slaat alleen op als hasActualMessage true is:
if (hasActualMessage && message) {
  await supabase.from('notifications').insert({...});
}
```

## Wijzigingen

### 1. `supabase/functions/trigger-seo-webhook/index.ts`

**Verwijder de `hasActualMessage` filtering (regels 147-214):**

De logica wordt vereenvoudigd:
- Lees altijd de raw response text
- Probeer JSON te parsen voor specifieke keys
- Als geen specifieke key gevonden, gebruik de volledige response
- Sla ALTIJD een melding op (met fallback naar "Geen bericht beschikbaar")
- Verwijder de `hasMessage` flag uit de response

```typescript
let message = 'Geen bericht beschikbaar';
let status = response.ok ? 'success' : 'error';

const rawText = await response.text().catch(() => '');

if (rawText && rawText.trim().length > 0) {
  try {
    const data = JSON.parse(rawText);
    // Probeer specifieke keys te vinden
    if (data.Output) {
      message = data.Output;
    } else if (data.message) {
      message = data.message;
    } else if (data.Goed) {
      message = data.Goed;
    } else if (data.Error || data.error) {
      message = data.Error || data.error;
      status = 'error';
    } else if (typeof data === 'string') {
      message = data;
    } else {
      // Stringify hele response als fallback
      message = JSON.stringify(data);
    }
  } catch {
    // Niet JSON, gebruik raw text
    message = rawText;
  }
}

// ALTIJD melding opslaan
await supabase.from('notifications').insert({
  message: message,
  status: status,
  user_id: userId,
});
```

### 2. `src/components/seo-blog/KeywordResearchForm.tsx`

**Verwijder `hasMessage` check (regels 210-217):**

Van:
```typescript
if (data.hasMessage && data.message) {
  toast({
    title: 'SEO Onderzoek voltooid',
    description: data.message,
    duration: 7000,
  });
}
```

Naar:
```typescript
const message = data.message || "SEO onderzoek succesvol gestart";
toast({
  title: 'SEO Onderzoek voltooid',
  description: message,
  duration: 7000,
});
```

## Resultaat

- Alle webhook responses worden opgeslagen in de `notifications` tabel
- Alle webhook responses worden getoond in toast meldingen
- Gebruikers zien altijd feedback, ook bij korte responses zoals "Workflow was started"
- De `trigger-blog-generation` functie werkt al correct en hoeft niet aangepast te worden
