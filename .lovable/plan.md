

## Nieuwe "Leads Generator" dashboard tile en pagina

### Wat wordt er gedaan

1. Een nieuwe dashboard tile "Leads Generator" die navigeert naar `/leads-generator`
2. Een nieuwe pagina met een formulier voor: **Locatie**, **Bedrijfsnaam** en **Bedrijfsbeschrijving**
3. De pagina volgt dezelfde opzet als de andere pagina's (dashboard-knop terug, formulier links, titel + beschrijving)

### Technische aanpassingen

**`src/pages/Index.tsx`**
- Nieuwe entry in `tileConfigMap`: `'leads-generator'` met route `/leads-generator`, icon `Users` (al geimporteerd), variant `'secondary'`, en statusKey `'leads-generator'`

**`src/App.tsx`**
- Import van nieuwe `LeadsGenerator` pagina
- Nieuwe `<Route path="/leads-generator" element={<LeadsGenerator />} />`

**`src/components/admin/dashboard/TileOrganizer.tsx`**
- Nieuwe entry in `tileConfig`: `'leads-generator'` met icon `Users` en variant `'secondary'`

**Nieuw bestand: `src/pages/LeadsGenerator.tsx`**
- Pagina met dezelfde structuur als andere tool-pagina's
- Dashboard-knop linksboven om terug te navigeren
- Titel "Leads Generator" met beschrijving
- Formulier met drie velden:
  - **Bedrijfsnaam** (tekstveld)
  - **Locatie** (tekstveld, bijv. stad of regio)
  - **Bedrijfsbeschrijving** (textarea voor langere tekst)
- Start-knop die disabled is als niet alle velden zijn ingevuld
- De knop roept een webhook aan via een edge function (placeholder voor nu)

**Database: automation_settings**
- Een nieuw record toevoegen voor `leads-generator` met display_name "Leads Generator" zodat de tile correct wordt weergegeven op het dashboard en in het admin panel

### Bestanden die worden aangepast/aangemaakt

| Bestand | Actie |
|---|---|
| `src/pages/LeadsGenerator.tsx` | Nieuw -- formulierpagina |
| `src/pages/Index.tsx` | Tile config toevoegen |
| `src/App.tsx` | Route toevoegen |
| `src/components/admin/dashboard/TileOrganizer.tsx` | Tile config toevoegen |
| Database migratie | Nieuw automation_settings record |

