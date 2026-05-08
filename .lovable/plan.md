

## Click-to-edit patroon toepassen op Pagina URL formulier

### Huidige situatie
- **KeywordResearchForm**: Gebruikt al het click-to-edit patroon (tekst weergeven, klik om te bewerken, auto-save bij blur)
- **BlogGenerationForm**: Gebruikt al het click-to-edit patroon via `renderField()`
- **PageUrlForm**: Gebruikt gewone `<Input>` velden die altijd bewerkbaar zijn - dit wijkt af van het patroon in de andere formulieren

### Wat verandert er
De velden in **PageUrlForm** worden omgezet naar hetzelfde click-to-edit patroon:
- Velden tonen standaard als leesbare tekst
- Klikken op het veld activeert de bewerkingsmodus
- Wijzigingen worden automatisch opgeslagen bij het verlaten van het veld (blur)

### Velden die aangepast worden

**PageUrlForm:**
1. **Bedrijfsnaam** - Blijft read-only met gradient border (geen wijziging nodig, dit veld komt uit het geselecteerde bedrijf)
2. **Pagina URL velden** - Omzetten van altijd-bewerkbare Input naar click-to-edit: tekst weergeven, klikken opent Input, blur slaat op
3. **Spreadsheet ID** (admin) - Omzetten naar click-to-edit
4. **Grid ID** (admin) - Omzetten naar click-to-edit

### Technische aanpak

**`src/components/seo-blog/PageUrlForm.tsx`:**
- `editingField` state toevoegen (zoals in de andere formulieren)
- Een `renderInputField()` helperfunctie maken die het click-to-edit patroon implementeert:
  - Niet-bewerkingsmodus: toont waarde als tekst in een `<div>` met hover-effect
  - Bewerkingsmodus: toont een `<Input>` met autoFocus en onBlur voor auto-save
- URL-velden aanpassen: elk URL-veld krijgt een unieke key (bijv. `url_0`, `url_1`) voor de editingField state
- Spreadsheet ID en Grid ID velden omzetten naar het click-to-edit patroon
- Pencil-icoon niet apart tonen - klik op het veld opent direct de bewerkingsmodus (consistent met BlogGenerationForm)

