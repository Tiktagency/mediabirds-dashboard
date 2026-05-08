
# Plan: Telefoonnummer Veld Toevoegen

## Overzicht

Voeg een optioneel telefoonnummer veld toe onder het "Functie" invulveld. Het veld valideert op een geldig telefoonnummerformaat.

---

## Wijzigingen

### 1. Database: Nieuwe kolom toevoegen

**Migratie SQL:**
```sql
ALTER TABLE email_signature_settings 
ADD COLUMN phone_number TEXT;
```

Dit voegt een optioneel veld toe voor het telefoonnummer.

---

### 2. Hook: Interface uitbreiden

**Bestand: `src/hooks/useEmailSignatureSettings.ts`**

Voeg `phone_number` toe aan de `EmailSignatureSettings` interface (regel 11-29):

```typescript
export interface EmailSignatureSettings {
  // ... bestaande velden ...
  job_title: string;
  phone_number: string | null;  // Nieuw - na job_title
  website: string | null;
  // ...
}
```

Update de `saveSettings` functie om `phone_number` mee te nemen in zowel update (regel 113-127) als insert (regel 135-150) queries.

---

### 3. Formulier: Telefoonnummer veld toevoegen

**Bestand: `src/components/email-signature/EmailSignatureForm.tsx`**

#### Zod schema uitbreiden (regel 21-32):
Voeg phone_number validatie toe met optioneel regex patroon:
```typescript
phone_number: z.string()
  .regex(/^[+]?[\d\s\-()]+$/, 'Ongeldig telefoonnummer formaat')
  .optional()
  .or(z.literal('')),
```

#### DefaultValues uitbreiden (regel 80-91):
```typescript
phone_number: '',
```

#### Auto-save effect uitbreiden (regel 137):
Voeg `watchedFields.phone_number` toe aan de dependency array.

#### Reset bij selectedSignature (regel 160-171 en 177-188):
```typescript
phone_number: selectedSignature.phone_number || '',
// en voor defaults:
phone_number: '',
```

#### triggerAutoSave data uitbreiden (regel 110-124):
```typescript
phone_number: data.phone_number || null,
```

#### signatureData in onSubmit uitbreiden (regel 232-246):
```typescript
phone_number: data.phone_number || null,
```

#### Nieuw invulveld toevoegen na Functie (na regel 404):
```typescript
<div className="space-y-2">
  <Label htmlFor="phone_number" className="text-white">Telefoonnummer (optioneel)</Label>
  <Input
    id="phone_number"
    type="tel"
    {...register('phone_number')}
    className="bg-white/10 border-white/20 text-white"
    placeholder="+31 6 12345678"
  />
  {errors.phone_number && (
    <p className="text-sm text-red-400">{errors.phone_number.message}</p>
  )}
</div>
```

---

## Samenvatting

| Component | Wijziging |
|-----------|-----------|
| Database | Nieuwe kolom `phone_number` (TEXT, nullable) |
| `useEmailSignatureSettings.ts` | `phone_number` in interface en queries |
| `EmailSignatureForm.tsx` | Nieuw optioneel telefoonnummer veld met validatie |

## Resultaat

- Nieuw tekstveld "Telefoonnummer (optioneel)" onder het Functie veld
- Validatie op geldig telefoonnummerformaat (cijfers, spaties, +, -, haakjes)
- Het veld is optioneel en kan leeg gelaten worden
- Auto-save werkt voor dit veld
- Waarde wordt meegestuurd naar de webhook
