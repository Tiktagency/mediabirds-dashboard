
## Plan: Nieuwsbrief webhook — vaste URL + stop loading bij response

### Probleem
De edge function haalt de webhook URL op uit `automation_settings` of de `N8N_WEBHOOK` env var — maar de gebruiker wil een vaste specifieke URL gebruiken: `https://tikt.app.n8n.cloud/webhook/f223c287-e186-4ebf-a8c1-7e9e70b0e17c`.

Daarnaast moet de laadstatus van de knop stoppen zodra er een antwoord terugkomt van de webhook (succesvol of fout).

### Wijzigingen

**1. `supabase/functions/trigger-newsletter-webhook/index.ts`**
- De vaste webhook URL hardcoden als primaire URL (of beter: als secret opslaan zodat het veilig en aanpasbaar blijft)
- De `N8N_WEBHOOK_AUTH_TOKEN` voor de Authorization header gebruiken (al beschikbaar als secret: `TIKT_WEBHOOK_AUTH_TOKEN`)
- Timeout verhogen naar 300 seconden (nieuwsbrief genereren kan lang duren)
- Response correct parsen: de webhook stuurt mogelijk HTML terug als string of als JSON key
- De functie retourneert altijd een response (succes of fout) — de frontend stopt het laden

**2. `src/pages/Nieuwsbrief.tsx`**
- De `handleGenerate` functie wacht al op de response en zet `setIsGenerating(false)` in `finally` — dit werkt al correct
- Extra: toast tonen met het teruggestuurde bericht als er geen HTML is maar wel een bericht

### Concrete aanpassing edge function

De webhook URL wordt als hardcoded waarde ingesteld in de edge function (veiliger als secret `NEWSLETTER_WEBHOOK_URL`). Aangezien de secret `TIKT_WEBHOOK_AUTH_TOKEN` al bestaat, wordt die gebruikt voor de Authorization header.

De URL `https://tikt.app.n8n.cloud/webhook/f223c287-e186-4ebf-a8c1-7e9e70b0e17c` wordt direct in de edge function gezet (geen automation_settings lookup nodig).

Response parsing: we proberen JSON te parsen en kijken naar `html`, `generated_html`, `content`, `message` keys. Als de response plain text HTML is, gebruiken we die direct.

**Bestanden:**
| Bestand | Aanpassing |
|---|---|
| `supabase/functions/trigger-newsletter-webhook/index.ts` | Vaste webhook URL, `TIKT_WEBHOOK_AUTH_TOKEN` gebruiken, betere response parsing, timeout 300s |

De Nieuwsbrief pagina (`src/pages/Nieuwsbrief.tsx`) werkt al correct — de `finally` blok zet de loading state altijd uit ongeacht succes/fout.
