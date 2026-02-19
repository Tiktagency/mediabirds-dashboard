

## Bedrijfsnaam als enige verplicht veld

### Wat verandert er

Bij het toevoegen van een nieuw bedrijf op de Landingspagina is alleen de **bedrijfsnaam** verplicht. De overige velden (domeinnaam, applicatie wachtwoord, spreadsheet ID, grid ID) blijven optioneel en kunnen later worden ingevuld.

### Aanpassing

**`src/components/landing/LandingCompanySelector.tsx`**

1. **Validatie versoepelen** (regel 168-171): de check `handleRequestAdd` vereist nu alleen `newCompanyName.trim()` in plaats van ook domain en password
2. **Button disabled-conditie** aanpassen: de "Toevoegen" knop is alleen disabled als de bedrijfsnaam leeg is (niet meer als domain/password leeg zijn)

### Technische details

**Regel 168-171 -- validatie:**
```typescript
const handleRequestAdd = () => {
  if (!newCompanyName.trim()) {
    toast({ title: 'Vul een bedrijfsnaam in', variant: 'destructive' });
    return;
  }
  // ...rest blijft hetzelfde
};
```

**Button disabled conditie (rond regel 305):**
```typescript
disabled={!newCompanyName.trim()}
```

### Bestanden

| Bestand | Wijziging |
|---|---|
| `src/components/landing/LandingCompanySelector.tsx` | Validatie en button-conditie: alleen bedrijfsnaam verplicht |

