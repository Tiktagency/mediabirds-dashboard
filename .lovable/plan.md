

## Veldopslag bevestigen met 1-seconde melding

### Probleem

De `localStorage`-opslag werkt technisch correct in de code (elke `onChange` slaat op), maar er is geen visuele bevestiging. Daarnaast wordt een extra `onBlur`-melding gevraagd.

### Wat wordt er aangepast

**`src/pages/LeadsGenerator.tsx`**

1. **onBlur handler toevoegen** aan elk invoerveld (Plaatsnaam, Country, elke Zoekterm)
2. Wanneer een veld wordt verlaten (`onBlur`) en het veld is **niet leeg**, wordt een korte toast getoond:
   - Titel: "Opgeslagen"
   - Duur: **1 seconde** (1000ms)
3. De `localStorage`-opslag blijft op `onChange` (elke toetsaanslag), zodat er nooit data verloren gaat
4. De `TOAST_REMOVE_DELAY` in `src/hooks/use-toast.ts` wordt verlaagd zodat korte toasts ook snel verdwijnen uit de DOM (momenteel staat deze op 3000ms, wat betekent dat een 1-seconde toast pas na 3 seconden wordt opgeruimd)

### Technische details

**Nieuwe functie in LeadsGenerator:**
```typescript
const handleFieldBlur = (fieldName: string, value: string) => {
  if (value.trim()) {
    toast({
      title: 'Opgeslagen',
      duration: 1000,
    });
  }
};
```

**Op elk Input element wordt `onBlur` toegevoegd:**
```typescript
<Input
  value={plaatsnaam}
  onChange={(e) => updatePlaatsnaam(e.target.value)}
  onBlur={() => handleFieldBlur('Plaatsnaam', plaatsnaam)}
  ...
/>
```

Hetzelfde voor Country en elke Zoekterm.

### Bestanden die worden aangepast

| Bestand | Wijziging |
|---|---|
| `src/pages/LeadsGenerator.tsx` | `onBlur` handler toevoegen aan alle invoervelden met 1-seconde "Opgeslagen" toast |

