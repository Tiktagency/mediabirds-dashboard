

## Landingspagina opbouwen met WordPress Alt-tekst structuur + Google Sheets velden

### Wat wordt er gedaan

De huidige lege Landingspagina wordt vervangen door een volledige pagina met dezelfde opzet als `/wordpress-alt-text`:

1. **Dashboard knop + bedrijfsselector** bovenaan (hergebruik van `AltTextCompanySelector`)
2. **Titel en beschrijving** (aangepast voor Landingspagina context)
3. **Schedule Trigger** voor automatische planning
4. **Bewerkbare velden** voor Bedrijfsnaam, Domeinnaam en Applicatie wachtwoord (inclusief tooltip)
5. **Twee extra Google Sheets velden**: Spreadsheet ID en Grid ID
6. **Start knop** met dezelfde validatie (alle velden verplicht incl. de twee nieuwe)
7. **Animatiepaneel** rechts (hergebruik van `AltTextAnimation`)

### Technische details

**`src/pages/Landingspagina.tsx`** -- volledig herschreven

De pagina wordt een kopie van `WordpressAltText.tsx` met de volgende aanpassingen:

- Titel wordt "Landingspagina" in plaats van "Alt-tekst wordpress"
- Beschrijving wordt aangepast
- Twee extra state variabelen: `editSheetId` en `editGridId`
- Twee extra bewerkbare velden in het formulier:
  - **Spreadsheet ID** (label: "Spreadsheet ID", placeholder: "Voer spreadsheet ID in...")
  - **Grid ID** (label: "Grid ID", placeholder: "Voer grid ID in...")
- Deze velden worden lokaal opgeslagen (niet naar `alt_text_companies` tabel, omdat die tabel die kolommen niet heeft)
- De velden gebruiken dezelfde `renderEditableField` functie als de andere velden
- Start knop is disabled als een van de 5 velden leeg is (naam, domein, wachtwoord, spreadsheet ID, grid ID)
- De webhook call (`trigger-alt-text-webhook`) stuurt de extra velden mee in de body: `spreadsheet_id` en `grid_id`

**Geen database wijzigingen nodig** -- de Google Sheets velden worden alleen als input naar de webhook gestuurd en niet persistent opgeslagen (tenzij je dat later wilt toevoegen).

**Hergebruikte componenten:**
- `AltTextCompanySelector` (bedrijfsselector)
- `AltTextAnimation` (animatiepaneel)
- `ScheduleTrigger` (planning)
- `useAltTextSchedule` (schedule hook)
- `useAdminAuth` (authenticatie check)

### Layout

De layout is identiek aan de WordPress Alt-tekst pagina:
- Boven: Dashboard knop links, bedrijfsselector rechts
- Midden: titel + beschrijving
- Onder: twee kolommen (links: formulier + start knop, rechts: animatie)
- De Google Sheets velden komen onder het Applicatie wachtwoord veld, gescheiden door een subtiele label "Google Sheets"

### Bestanden die worden aangepast

| Bestand | Actie |
|---|---|
| `src/pages/Landingspagina.tsx` | Volledig herschreven met alt-tekst structuur + Google Sheets velden |

