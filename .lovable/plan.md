

## Bedrijfsgegevens bewerkbaar maken met drie-stappen patroon

### Wat er verandert
De bedrijfsnaam en domeinnaam op de WordPress Alt-Tekst pagina worden bewerkbaar via het bestaande drie-stappen interactiepatroon (collapsed > expanded met potloodje > editing). Beide velden krijgen een duidelijk kopje erboven.

### Aanpassingen

**`src/pages/WordpressAltText.tsx`**

- Voeg state toe voor `expandedField` en `editingField` (zoals in PageUrlForm)
- Voeg een `useEffect` toe voor click-outside handler om expanded velden dicht te klappen
- Vervang het huidige statische weergaveblok door twee bewerkbare velden:
  - **"Bedrijfsnaam:"** label + drie-stappen veld voor `name`
  - **"Domeinnaam:"** label + drie-stappen veld voor `domain`
- Voeg een `renderEditableField` helper functie toe (gebaseerd op `renderInputField` uit PageUrlForm):
  - **Collapsed**: toont alleen de tekst, klikbaar
  - **Expanded**: toont tekst + Pencil-icoon rechts
  - **Editing**: Input-veld, wijzigingen opslaan bij blur
- Bij blur: update het bedrijf in de `alt_text_companies` tabel via Supabase en werk de lokale state bij
- Importeer `Pencil` uit lucide-react en `Input` component

**`src/components/wordpress-alt-text/AltTextCompanySelector.tsx`**

- Geen wijzigingen nodig; de `onSelect` callback geeft al het volledige company-object terug met `id`, `name` en `domain`

### Visuele weergave

```
+----------------------------------+
|  Dashboard          [Dropdown]   |
+----------------------------------+
|                                  |
|      Alt-tekst wordpress         |
|                                  |
|   +------------------------+     |
|   | Bedrijfsnaam:          |     |
|   | [Reneko Kozijnen    ]  |     |  <-- klikbaar, drie-stappen
|   |                        |     |
|   | Domeinnaam:            |     |
|   | [reneko.nl          ]  |     |  <-- klikbaar, drie-stappen
|   +------------------------+     |
|                                  |
+----------------------------------+
```

### Technische details

- De `renderEditableField` functie krijgt parameters: `fieldId`, `value`, `onChange`, `onBlur`, `placeholder`
- Bij blur wordt `supabase.from('alt_text_companies').update({ [field]: newValue }).eq('id', selectedCompany.id)` aangeroepen
- Na succesvolle update wordt `setSelectedCompany` bijgewerkt met de nieuwe waarden
- Het drie-stappen patroon volgt exact dezelfde implementatie als in `PageUrlForm.tsx` (regels 130-190)
