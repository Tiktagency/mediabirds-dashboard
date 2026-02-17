
## Webhook response als popup tonen

### Wat verandert er
Wanneer je op "URL's documenteren" klikt, blijft het laadsymbool draaien (dit werkt al). Na ontvangst van het webhook-antwoord verschijnt het bericht als een popup-melding die 5 seconden zichtbaar blijft.

### Technische wijzigingen

**Bestand: `src/components/seo-blog/PageUrlForm.tsx`**

In de `handleTriggerWebhook` functie (regels 184-191) wordt na elke `saveNotification` aanroep een `toast()` call toegevoegd met een `duration` van 5000ms:

- Bij succes: een toast met variant "default" en het webhook-antwoordbericht
- Bij fout (HTTP error): een toast met variant "destructive" en het foutbericht  
- Bij catch (netwerkfout): een toast met variant "destructive" en het generieke foutbericht

De bestaande `saveNotification` aanroepen blijven behouden zodat meldingen ook in de database worden opgeslagen (bestaand gedrag).

**Bestand: `src/components/ui/sonner.tsx`**

Geen wijzigingen nodig -- de component gebruikt de `useToast` hook van shadcn die al beschikbaar is in `PageUrlForm`.
