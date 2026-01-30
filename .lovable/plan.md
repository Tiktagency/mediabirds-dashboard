
# Plan: Fix Extra Velden Opslaan en Laden

## Probleem

Wanneer een gebruiker een tweede email, telefoonnummer of plaatsnaam toevoegt en de pagina verlaat, verdwijnt het extra invulveld. Dit komt doordat:

1. De data wordt opgeslagen als `JSON.stringify(array)` → een string in de database
2. Bij ophalen checkt `parseJsonArray` alleen of de waarde een array is
3. Als het een string is (de gestringified JSON), wordt een lege array teruggegeven

---

## Oplossing

Update de `parseJsonArray` functie in `useEmailSignatureSettings.ts` om zowel arrays als gestringified arrays te ondersteunen.

---

## Code Wijzigingen

**Bestand: `src/hooks/useEmailSignatureSettings.ts`**

### parseJsonArray functie uitbreiden (regel 51-54)

**Huidige code:**
```typescript
const parseJsonArray = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === 'string');
  return [];
};
```

**Nieuwe code:**
```typescript
const parseJsonArray = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === 'string');
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.filter((v): v is string => typeof v === 'string');
    } catch {
      return [];
    }
  }
  return [];
};
```

---

## Wat dit oplost

| Scenario | Voorheen | Na fix |
|----------|----------|--------|
| Database retourneert `["a@b.nl", "c@d.nl"]` (array) | ✅ Werkt | ✅ Werkt |
| Database retourneert `'["a@b.nl", "c@d.nl"]'` (string) | ❌ Lege array | ✅ Parsed correct |

---

## Resultaat

- Extra emails, telefoonnummers en plaatsnamen blijven behouden na het verlaten van de pagina
- De extra invulvelden worden correct weergegeven wanneer de handtekening opnieuw wordt geladen
