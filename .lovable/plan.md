

## Progressiebalk animatie fix + ERROR melding

### Probleem

1. **Progressiebalk laadt niet visueel** -- De Progress component heeft `transition-all` maar geen expliciete `duration`, waardoor de browser de animatie mogelijk niet vloeiend toont bij kleine stappen (0.33% per seconde).
2. **Geen duidelijke ERROR melding** -- Als de webhook snel stopt zonder een goed antwoord terug te sturen, krijg je een vage foutmelding in plaats van een duidelijk "ERROR" bericht.

### Oplossing

**1. Progress component (`src/components/ui/progress.tsx`)**

De CSS-klasse `transition-all` wordt vervangen door een expliciete transitie met duur, zodat de balk vloeiend beweegt:
- `transition-all` wordt `transition-all duration-1000 ease-linear`
- Dit zorgt dat elke stap (elke seconde) vloeiend geanimeerd wordt over 1 seconde

**2. Foutafhandeling in LeadsGenerator (`src/pages/LeadsGenerator.tsx`)**

- Wanneer de edge function een error teruggeeft (ook als de webhook snel stopt): toon een toast met titel **"ERROR"** en een rode variant
- Wanneer de webhook wel een antwoord stuurt maar `success: false`: ook "ERROR" tonen
- Check ook of de response data leeg is of geen bruikbaar bericht bevat -- ook dan "ERROR"
- De foutmelding wordt specifieker:
  - Timeout (5 min): "Timeout: geen antwoord binnen 5 minuten"
  - Webhook stopt snel zonder antwoord: "ERROR: de webhook heeft geen resultaat teruggestuurd"
  - Overige fouten: "ERROR: er ging iets mis bij het verwerken"

**3. Edge function (`supabase/functions/trigger-leads-webhook/index.ts`)**

- Als de webhook een niet-200 status teruggeeft, wordt dit als error behandeld met de response body als foutmelding
- Dit zorgt ervoor dat snelle mislukkingen correct als fout worden doorgestuurd naar de frontend

### Technische wijzigingen

| Bestand | Wijziging |
|---|---|
| `src/components/ui/progress.tsx` | `transition-all` naar `transition-all duration-1000 ease-linear` op de Indicator |
| `src/pages/LeadsGenerator.tsx` | Error handling verbeteren: expliciete "ERROR" titel, check op lege/mislukte response |
| `supabase/functions/trigger-leads-webhook/index.ts` | Niet-200 status van webhook als error behandelen |
