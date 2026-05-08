

# Bedrijf toevoegen: domeinnaam, laadstatus en bevestiging

## Wat verandert er

1. Bij het toevoegen van een bedrijf moet ook een website domeinnaam worden ingevuld (bijv. "mediabirds.nl")
2. Tijdens het aanmaken verschijnt een laadsymbool (spinner) zodat de gebruiker weet dat het bezig is
3. Na klikken op "Toevoegen" verschijnt eerst een bevestigingsdialoog voordat het bedrijf daadwerkelijk wordt aangemaakt

## Aanpak

### 1. Database: kolom `domain` toevoegen aan `companies`

Een nieuwe nullable text-kolom `domain` wordt toegevoegd aan de `companies` tabel om de domeinnaam op te slaan.

```sql
ALTER TABLE companies ADD COLUMN domain text;
```

### 2. CompanySelector aanpassen

**Nieuw invoerveld**: Een extra input voor de domeinnaam onder het bedrijfsnaam-veld, met placeholder "bijv. mediabirds.nl".

**Bevestigingsdialoog**: Wanneer de gebruiker op "Toevoegen" klikt, sluit de invoer-dialoog en opent een AlertDialog met:
- Titel: "Bedrijf toevoegen?"
- Beschrijving: "Weet je zeker dat je [bedrijfsnaam] (domeinnaam) wilt toevoegen? De bijbehorende documenten worden automatisch aangemaakt."
- Knoppen: "Annuleren" en "Bevestigen"

**Laadstatus**: Na bevestiging:
- De "Bevestigen" knop wordt disabled en toont een spinner + "Bezig met aanmaken..."
- De dialoog blijft open totdat het hele proces (insert + webhook + opslaan) is afgerond
- Pas daarna sluit alles en wordt het nieuwe bedrijf geselecteerd

**Domeinnaam meesturen**: De domeinnaam wordt opgeslagen in de `companies` tabel bij het inserten en meegestuurd naar de edge function.

### 3. Edge function aanpassen

De edge function ontvangt nu ook `companyDomain` en stuurt dit mee naar de webhook als `domeinnaam` in de payload.

### 4. Company interface uitbreiden

De `Company` interface krijgt een optioneel `domain` veld.

## Technische details

- Validatie: zowel bedrijfsnaam als domeinnaam moeten ingevuld zijn voordat de "Toevoegen" knop actief wordt
- De flow wordt: Invoerdialoog -> Bevestigingsdialoog -> Laadstatus -> Toast resultaat
- Het spinner-icoon gebruikt Lucide's `Loader2` met `animate-spin`

