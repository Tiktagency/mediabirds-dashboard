
# Notities: editing-modus uitklappen, weergavemodus compact met scroll

## Wat verandert er

- **Weergavemodus (expanded)**: Blijft zoals nu -- maximale hoogte van 200px met scrollbar bij lange tekst. Het vak rekt niet uit.
- **Bewerkingsmodus (editing)**: De textarea krijgt **geen maximale hoogte-beperking**, zodat je alle tekst in één keer kunt zien zonder te scrollen. Wanneer je klaar bent (onBlur), krimpt het vak weer terug naar de compacte weergave met scroll.

## Wijzigingen

**Bestand:** `src/pages/SeoBlog.tsx`

### 1. Textarea in editing-modus (regel 364)
- Verwijder `max-h-[200px] overflow-y-auto` van de textarea class.
- Verander `min-h-[80px]` naar `min-h-[80px]` (blijft) en voeg `h-auto` toe zodat de textarea automatisch meegroeit met de inhoud.
- De textarea mag dus onbeperkt groeien zodat alle tekst zichtbaar is tijdens het bewerken.

### 2. Weergavemodus (regel 352)
- Blijft ongewijzigd: `max-h-[200px] overflow-y-auto` zorgt ervoor dat het vak compact blijft met een scrollbar.

## Resultaat
- Bij het bewerken zie je al je tekst volledig (textarea groeit mee)
- Zodra je klaar bent krimpt het vak terug naar max 200px met scrollbar
- Het vak rekt niet uit in de weergavemodus
