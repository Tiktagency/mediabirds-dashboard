

## Plan: Domeinnaam verplicht bij aanmaken nieuwsbrief bedrijf

### Wat verandert
Het "Nieuw bedrijf toevoegen" dialoog krijgt een extra verplicht veld voor de domeinnaam. Bij het opslaan wordt automatisch de `website` kolom gevuld met `https://{domein}`.

### Aanpassingen in `src/components/nieuwsbrief/NewsletterCompanySelector.tsx`

1. **Nieuwe state**: `newCompanyDomain` (string) naast de bestaande `newCompanyName`
2. **Dialog uitbreiden**: Extra `<Input>` veld met label "Domeinnaam" en placeholder "bijv. tikt.nl" onder het naam-veld
3. **Validatie**: `handleRequestAdd` controleert dat beide velden ingevuld zijn
4. **Insert aanpassen**: Bij `handleConfirmAdd` wordt het insert-object uitgebreid:
   ```ts
   { name: newCompanyName.trim(), bedrijfsnaam: newCompanyName.trim(), website: `https://${newCompanyDomain.trim()}` }
   ```
5. **Reset**: `newCompanyDomain` wordt geleegd na succesvol aanmaken
6. **Bevestigingsdialoog**: Toont ook de domeinnaam ter controle

Geen database wijzigingen nodig — de `website` kolom bestaat al op `newsletter_companies`.

