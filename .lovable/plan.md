

## Placeholder voorbeeld en validatie voor alle velden

### Probleem
1. Het applicatie wachtwoord veld heeft geen duidelijk voorbeeld placeholder
2. De Start knop is niet geblokkeerd wanneer niet alle velden (naam, domein, wachtwoord) zijn ingevuld

### Aanpassingen

**1. `src/components/wordpress-alt-text/AltTextCompanySelector.tsx` (regel 272)**
- Placeholder van het wachtwoord veld in de "toevoegen" dialog wijzigen naar: `abcd efgh ijkl 1234`

**2. `src/pages/WordpressAltText.tsx`**
- Placeholder van het wachtwoord veld (regel 197 en 207) wijzigen naar: `abcd efgh ijkl 1234`
- Start knop (regel 216): extra `disabled` conditie toevoegen die controleert of `editName`, `editDomain` en `editPassword` alle drie gevuld zijn
- De webhook aanroep (regel 68-74): ook `app_password` meesturen in de body, en een early return met toast als niet alle velden zijn ingevuld

### Technische details

**AltTextCompanySelector.tsx regel 272:**
```
placeholder="abcd efgh ijkl 1234"
```

**WordpressAltText.tsx - handleStart functie:**
```typescript
const handleStart = async () => {
  if (!selectedCompany) return;
  if (!editName.trim() || !editDomain.trim() || !editPassword.trim()) {
    toast({ title: 'Vul alle velden in', description: 'Bedrijfsnaam, domeinnaam en applicatie wachtwoord zijn verplicht', variant: 'destructive' });
    return;
  }
  // ... rest van de functie
};
```

**WordpressAltText.tsx - Start knop disabled conditie:**
```
disabled={isStarting || schedule?.enabled === true || !editName.trim() || !editDomain.trim() || !editPassword.trim()}
```

**WordpressAltText.tsx - webhook body (regel 74):**
```
body: { bedrijfsnaam: selectedCompany.name, domain: selectedCompany.domain, app_password: selectedCompany.app_password }
```

**WordpressAltText.tsx - placeholders (regels 197 en 207):**
```
placeholder="abcd efgh ijkl 1234"
// en
{editPassword ? '••••••••••••' : 'abcd efgh ijkl 1234'}
```

