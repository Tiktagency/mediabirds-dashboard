

## Webhook response berichten altijd opslaan als notificatie

### Huidige situatie
De code slaat al notificaties op en toont toasts, maar bij netwerkfouten (catch-blok) wordt een generiek bericht "Fout bij het starten van documentatie" opgeslagen in plaats van de werkelijke foutmelding. Daarnaast worden lege responses opgeslagen als "URL documentatie gestart" zonder verdere context.

### Wijzigingen

**Bestand: `src/components/seo-blog/PageUrlForm.tsx`**

1. **Catch-blok verbeteren**: Het werkelijke error-bericht meenemen in de notificatie zodat je kunt zien wat er fout ging:
   - Van: `'Fout bij het starten van documentatie'`
   - Naar: `'Fout bij het starten van documentatie: ' + (error instanceof Error ? error.message : String(error))`

2. **Lege response afhandelen**: Wanneer de webhook een lege body terugstuurt, een duidelijker bericht opslaan:
   - Van: response text als lege string die dan valt op de fallback `'URL documentatie gestart'`
   - Naar: expliciet `'no response body'` detecteren en het opslaan als `'URL documentatie gestart (geen response body)'`

3. **Bedrijfsnaam toevoegen aan notificatie**: De bedrijfsnaam (reeds beschikbaar via `companyName` snapshot) toevoegen aan het notificatiebericht zodat je kunt zien voor welk bedrijf het bericht is:
   - Succes: `[Bedrijfsnaam] URL documentatie: {message}`
   - Fout: `[Bedrijfsnaam] Fout: {message}`
   - Catch: `[Bedrijfsnaam] Fout bij documentatie: {error.message}`
