

## Drie-stappen click-to-edit patroon voor alle formulieren

### Gewenst gedrag
1. **Standaard (dicht)**: Veld toont de tekst, geen potlood-icoon zichtbaar
2. **Klik op veld (open)**: Veld toont de volledige tekst met een potlood-icoon rechts. Klikken buiten het veld klapt het weer dicht
3. **Klik op potlood (bewerken)**: Pas dan wordt het veld een invoerveld. Auto-save bij blur

Dit patroon bestaat al in KeywordResearchForm voor textarea-velden (`expandedField` state). Het moet nu worden toegepast op alle velden in alle drie de formulieren.

### Aanpassingen per bestand

**1. `src/components/seo-blog/BlogGenerationForm.tsx`**
- `expandedField` state toevoegen (bestaat nog niet in dit bestand)
- Click-outside handler toevoegen (zoals in KeywordResearchForm)
- `renderField` aanpassen voor tekst- en textarea-velden (niet voor select):
  - Standaard div: geen potlood, klik zet `expandedField`
  - Expanded div: toont tekst + potlood-icoon, klik op potlood zet `editingField`
  - Editing: bestaande Input/Textarea logica blijft

**2. `src/components/seo-blog/KeywordResearchForm.tsx`**
- `renderInputField`: zelfde drie-stappen patroon toepassen (standaard velden en lege Google ID velden)
  - Standaard: geen potlood, klik zet `expandedField`
  - Expanded: toont tekst + potlood, klik op potlood zet `editingField`
- `renderTextField`: werkt al correct met dit patroon - collapsed toont geen potlood, expanded toont potlood. Maar momenteel toont collapsed WEL een potlood (door de laatste wijziging). Dit moet worden teruggedraaid zodat collapsed geen potlood toont.

**3. `src/components/seo-blog/PageUrlForm.tsx`**
- `expandedField` state toevoegen
- Click-outside handler toevoegen
- `renderInputField` aanpassen: standaard zonder potlood, klik opent expanded met potlood, klik op potlood opent editing

### Technische details

Elke `renderInputField`/`renderField` krijgt drie states:

```text
State 1 - Collapsed (standaard):
  <div onClick={() => setExpandedField(field)}>
    <span>{value || 'Niet ingesteld'}</span>
    // GEEN potlood
  </div>

State 2 - Expanded (veld aangeklikt):
  <div className="expanded-field-container relative">
    <div>{value}</div>
    <Button onClick={() => { setExpandedField(null); setEditingField(field); }}>
      <Pencil />
    </Button>
  </div>

State 3 - Editing (potlood aangeklikt):
  <Input autoFocus onBlur={handleSave} />
```

De click-outside handler sluit expanded velden wanneer je ergens anders klikt:

```text
useEffect: document.addEventListener('mousedown', handler)
  als expandedField en klik NIET in .expanded-field-container:
    setExpandedField(null)
```
