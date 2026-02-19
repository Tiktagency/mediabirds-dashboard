

## Formuliergegevens automatisch opslaan (Leads Generator)

### Wat wordt er gedaan

De drie invulvelden (Plaatsnaam, Country, Zoektermen) worden automatisch opgeslagen in de browser via `localStorage`. Wanneer je de pagina herlaadt of later terugkomt, staan je eerder ingevulde gegevens er nog.

### Hoe werkt het

- Bij het laden van de pagina worden opgeslagen waarden uit `localStorage` gelezen en als startwaarde gebruikt
- Bij elke wijziging van een veld wordt de nieuwe waarde direct opgeslagen
- Na een succesvolle webhook-aanroep worden de opgeslagen gegevens gewist (schone lei)

### Technische details

**`src/pages/LeadsGenerator.tsx`**

Drie `localStorage` keys worden gebruikt:
- `leads-generator-plaatsnaam`
- `leads-generator-country`
- `leads-generator-zoektermen` (JSON array)

Wijzigingen:

1. State initialisatie leest uit localStorage:
```typescript
const [plaatsnaam, setPlaatsnaam] = useState(
  () => localStorage.getItem('leads-generator-plaatsnaam') || ''
);
const [country, setCountry] = useState(
  () => localStorage.getItem('leads-generator-country') || ''
);
const [zoektermen, setZoektermen] = useState<string[]>(() => {
  try {
    const saved = localStorage.getItem('leads-generator-zoektermen');
    return saved ? JSON.parse(saved) : [''];
  } catch { return ['']; }
});
```

2. Wrapper functies die zowel state updaten als opslaan:
```typescript
const updatePlaatsnaam = (val: string) => {
  setPlaatsnaam(val);
  localStorage.setItem('leads-generator-plaatsnaam', val);
};
// Idem voor country en zoektermen
```

3. Na succesvolle webhook: localStorage items verwijderen zodat het formulier bij de volgende keer leeg begint.

### Bestanden die worden aangepast

| Bestand | Actie |
|---|---|
| `src/pages/LeadsGenerator.tsx` | localStorage lezen bij laden, opslaan bij wijziging, wissen na succes |

