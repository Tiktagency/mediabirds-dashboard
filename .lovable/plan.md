
## Probleem

De newsletter webhook stuurt de gegenereerde HTML **direct** als response terug. De huidige aanpak is echter asynchroon: de edge function slaat de HTML op in de database, en de frontend pollt elke 5 seconden gedurende max 3.5 minuten.

Dit is onnodig complex en vertraagt de feedback aan de gebruiker.

## Oplossing: Directe response, geen polling

### Edge function (`trigger-newsletter-webhook`)
Verander "fire-and-forget" naar een gewone `await fetch(...)`. De webhook response wordt direct teruggestuurd naar de frontend.

```ts
// Wacht op de echte response
const webhookResponse = await fetch(NEWSLETTER_WEBHOOK_URL, { ... });
const responseText = await webhookResponse.text();
// Extraheer HTML en sla op in DB
// Stuur HTML direct terug in de response
return new Response(JSON.stringify({ success: true, html: generatedHtml }), ...);
```

### Frontend (`Nieuwsbrief.tsx`)
Verwijder de polling loop. Na de edge function call is het resultaat direct beschikbaar:

```ts
const response = await supabase.functions.invoke('trigger-newsletter-webhook', { body: ... });
// Geen polling nodig — HTML zit direct in response.data.html
setGeneratedHtmlLocal(response.data.html);
toast({ title: 'Nieuwsbrief gegenereerd!' });
setIsGenerating(false);
```

### Bestanden

| Bestand | Aanpassing |
|---|---|
| `supabase/functions/trigger-newsletter-webhook/index.ts` | `await fetch(...)` i.p.v. fire-and-forget, HTML direct in response |
| `src/pages/Nieuwsbrief.tsx` | Polling verwijderen, directe response verwerken als toast |

> De DB-update (`generated_html`) blijft behouden voor persistentie, maar de frontend hoeft niet meer te wachten op polling.
