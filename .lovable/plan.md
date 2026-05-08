
## Plan: Nieuwsbrief invulvelden — three-step potlood-patroon

### Wat het huidige patroon op de Blog pagina doet

De `BlogGenerationForm` heeft een `renderField` helper die drie states bijhoudt per veld:

1. **Collapsed** — smal klikbaar vakje (`h-[40px]`, `bg-white/5 border-white/10`), toont de waarde of *"Niet ingesteld"* in italic. Klik → expanded.
2. **Expanded** — volle tekstweergave + potlood-knop rechts. Klik potlood → editing.
3. **Editing** — `Input` of `Textarea` met `autoFocus`. Bij `onBlur` wordt `handleSaveField` aangeroepen, die:
   - vergelijkt met de originele waarde (niets doen als ongewijzigd)
   - anders `saveSettings` aanroept
   - bij succes: "Opgeslagen" toast + `setEditingField(null)`

State wordt bijgehouden in twee variabelen: `editingField` en `expandedField`.

### Wat er nu op de Nieuwsbrief pagina staat

De velden `bedrijfsnaam`, `bedrijfsinformatie` en `schrijfstijl` zijn gewone `Input`/`Textarea` componenten die bij elke keystroke `saveSettings` triggeren (via debounce in de hook). Er is geen collapsed/expanded staat, geen potlood-icoontje.

### Aanpak

Alle drie tekstvelden (`bedrijfsnaam`, `bedrijfsinformatie`, `schrijfstijl`) omzetten naar het three-step patroon:

**State toevoegen:**
```tsx
const [editingField, setEditingField] = useState<string | null>(null);
const [expandedField, setExpandedField] = useState<string | null>(null);
```

**Lokale formData state naast `settings`:**
De `useNewsletterSettings` hook heeft al debounced saving, maar voor het three-step patroon werkt lokale state beter: de gebruiker kan typen zonder elke keystroke op te slaan, en opslaan gebeurt op `onBlur`.

Lokale state:
```tsx
const [localData, setLocalData] = useState({ bedrijfsnaam: '', bedrijfsinformatie: '', schrijfstijl: '' });
```
Gesynchroniseerd met `settings` via `useEffect`.

**`handleSaveField` functie:**
Vergelijkt `localData[field]` met `settings[field]`. Als ongewijzigd: alleen `setEditingField(null)`. Als gewijzigd: `saveSettings({ [field]: localData[field] })` + "Opgeslagen" toast.

**`renderField` helper** (dezelfde drie-stap structuur als Blog):
- Collapsed: klikbaar `div` met `h-[40px]` + truncated tekst
- Expanded: volledige tekst + `Pencil` knop
- Editing: `Input` of `Textarea` met `onBlur={() => handleSaveField(field)}`

**Click outside handler** voor `expandedField` (zelfde als Blog).

**Kleuren** (`achtergrond_kleur`, `primaire_kleur`, `accent_kleur`): deze werken al goed via de kleurpicker + debounce, en zijn niet van het potlood-type. Die blijven ongewijzigd.

**RSS Feeds**: ook ongewijzigd — die hebben al hun eigen add/remove UI.

### Bestanden

| Bestand | Aanpassing |
|---|---|
| `src/pages/Nieuwsbrief.tsx` | Three-step field patroon voor `bedrijfsnaam`, `bedrijfsinformatie`, `schrijfstijl` |
