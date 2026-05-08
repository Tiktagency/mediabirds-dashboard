

# Links uitlijnen + Notities vakje op SEO pagina

## Wat verandert er

De titel ("SEO"), subtitel en "Beheerd door" dropdown worden naar links uitgelijnd. Rechts daarnaast komt een opvallend notitievak waar gebruikers aantekeningen kunnen achterlaten voor collega's.

## Layout

```text
+------------------------------------------+-----------------------------+
| SEO                                      | [!] Notities                |
| Beheer je zoekwoord onderzoek en blog... |                             |
| Beheerd door: [dropdown]                 | [textarea met notities]     |
|                                          |                             |
|                                          |           [Opslaan]         |
+------------------------------------------+-----------------------------+
```

## Wijzigingen

### 1. Database: `notes` kolom toevoegen aan `companies`
Een nieuwe nullable `text` kolom `notes` wordt toegevoegd aan de `companies` tabel, zodat notities per bedrijf worden opgeslagen.

```sql
ALTER TABLE companies ADD COLUMN notes text;
```

### 2. Layout aanpassen in `src/pages/SeoBlog.tsx`
- De huidige `flex-col items-center text-center` container wordt een horizontale `flex` row met twee kolommen
- Linkerkolom: titel, subtitel en "Beheerd door" -- allemaal `text-left` uitgelijnd
- Rechterkolom: een notitievak met rode accenten (rode linkerborder en rood icoon)
- Het notitievak bevat een `textarea` en een opslaan-knop
- Notities worden geladen wanneer een bedrijf wordt geselecteerd en opgeslagen in `companies.notes`

### 3. Notitievak ontwerp
- Rode linkerborder (`border-l-4 border-red-500`)
- Rood waarschuwingsicoon (AlertTriangle of MessageSquare in rood)
- Donkere achtergrond consistent met de rest van de pagina (`bg-white/5`)
- Textarea met placeholder "Laat hier notities achter voor je collega's..."
- Compacte opslaan-knop onderaan

## Technische Details

**Bestanden die worden aangepast:**
- `src/pages/SeoBlog.tsx` -- layout wijzigen, state + logica voor notities toevoegen
- Database migratie -- `notes` kolom

**State toevoegingen:**
- `notes: string` -- huidige notitie-tekst
- `handleSaveNotes` -- upsert naar `companies.notes`

**Het notitievak is alleen zichtbaar wanneer een bedrijf is geselecteerd**, net als de "Beheerd door" dropdown.
