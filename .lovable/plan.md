

# Notities vak aanpassen

## Wat verandert er

1. **Rode lijn weg** -- de `border-l-4 border-red-500` wordt verwijderd
2. **Icoon weg** -- het AlertTriangle icoon voor "Notities" wordt verwijderd
3. **Rode tekst** -- de tekst in het notitieveld wordt rood (`text-red-400`)
4. **Opslaan knop weg** -- vervangen door hetzelfde bewerkingssysteem als bij "Bedrijfsomschrijving": klik om te expanderen, potlood-icoon om te bewerken, vinkje om op te slaan, kruisje om te annuleren

## Bewerkingssysteem (3 staten)

Hetzelfde patroon als `renderTextField` in KeywordResearchForm:

1. **Ingeklapt**: eenregelig vak met afgekapte tekst, klikbaar om te expanderen
2. **Uitgeklapt**: volledige tekst zichtbaar met een potlood-icoon (rechtsboven) om te bewerken
3. **Bewerken**: textarea met een groen vinkje (opslaan) en rood kruisje (annuleren)

De tekst in alle drie de staten wordt rood weergegeven.

## Technische Details

**Bestand:** `src/pages/SeoBlog.tsx`

- Nieuwe state toevoegen: `notesEditMode` (`'collapsed' | 'expanded' | 'editing'`) en `notesDraft` (string voor bewerkingswaarde)
- Het huidige notities-blok (regels 332-354) wordt vervangen door het nieuwe 3-statenpatroon
- `handleSaveNotes` blijft bestaan maar wordt aangeroepen via het vinkje in plaats van de knop
- `isSavingNotes` state blijft behouden
- Importeer `Check`, `XCircle`, `Pencil` iconen (Check en XCircle al beschikbaar, Pencil toevoegen aan imports)
- Verwijder `Save` en `AlertTriangle` uit imports als ze nergens anders meer gebruikt worden
