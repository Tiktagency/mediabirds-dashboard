
# Plan: Meerdere Emails, Plaatsnamen en Telefoonnummers

## Overzicht

Maak het mogelijk om maximaal 2 emails, 2 telefoonnummers en 2 plaatsnamen toe te voegen aan een email handtekening. Dit wordt gerealiseerd door de enkelvoudige velden om te zetten naar arrays (JSONB in de database).

---

## Database Wijzigingen

### Migratie SQL

```sql
-- Voeg nieuwe array kolommen toe
ALTER TABLE email_signature_settings 
ADD COLUMN emails JSONB DEFAULT '[]'::jsonb,
ADD COLUMN phone_numbers JSONB DEFAULT '[]'::jsonb,
ADD COLUMN locations JSONB DEFAULT '[]'::jsonb;

-- Migreer bestaande data naar arrays
UPDATE email_signature_settings 
SET 
  emails = CASE WHEN email IS NOT NULL THEN jsonb_build_array(email) ELSE '[]'::jsonb END,
  phone_numbers = CASE WHEN phone_number IS NOT NULL THEN jsonb_build_array(phone_number) ELSE '[]'::jsonb END,
  locations = CASE WHEN location IS NOT NULL THEN jsonb_build_array(location) ELSE '[]'::jsonb END;
```

De oude kolommen (`email`, `phone_number`, `location`) worden behouden voor backwards compatibility.

---

## Hook Wijzigingen

**Bestand: `src/hooks/useEmailSignatureSettings.ts`**

### Interface uitbreiden

```typescript
export interface EmailSignatureSettings {
  // ... bestaande velden ...
  email: string;           // Primaire email (verplicht, backwards compat)
  emails: string[];        // Extra emails (max 2)
  phone_number: string | null;
  phone_numbers: string[]; // Extra telefoonnummers (max 2)
  location: string | null;
  locations: string[];     // Extra plaatsnamen (max 2)
  // ...
}
```

### parseSignature functie updaten

Zorg dat `emails`, `phone_numbers` en `locations` correct als arrays worden geparsed.

### saveSettings functie updaten

Voeg de nieuwe array velden toe aan zowel de update als insert queries.

---

## Formulier Wijzigingen

**Bestand: `src/components/email-signature/EmailSignatureForm.tsx`**

### State toevoegen voor extra velden

```typescript
const [extraEmails, setExtraEmails] = useState<string[]>([]);
const [extraPhoneNumbers, setExtraPhoneNumbers] = useState<string[]>([]);
const [extraLocations, setExtraLocations] = useState<string[]>([]);
```

### UI Component: Dynamische velden

Voor elk type (email, telefoonnummer, plaatsnaam) wordt een component gemaakt met:
- Het eerste (primaire) veld (email is verplicht)
- Een "+" knop om een extra veld toe te voegen (max 1 extra = 2 totaal)
- Een "x" knop bij extra velden om ze te verwijderen

Voorbeeld voor Email sectie:
```text
+------------------------------------------+
| Email *                                  |
| [jan@bedrijf.nl                    ]     |
| [+] Extra email toevoegen                |
+------------------------------------------+

Na toevoegen:
+------------------------------------------+
| Email *                                  |
| [jan@bedrijf.nl                    ]     |
|                                          |
| Extra email                              |
| [info@bedrijf.nl               ] [x]     |
+------------------------------------------+
```

### Validatie uitbreiden

Het Zod schema wordt uitgebreid om arrays te valideren:

```typescript
extra_emails: z.array(
  z.string().email('Ongeldig email adres').or(z.literal(''))
).max(1),
extra_phone_numbers: z.array(
  z.string().regex(/^[+]?[\d\s\-()]+$/, 'Ongeldig telefoonnummer').or(z.literal(''))
).max(1),
extra_locations: z.array(
  z.string().or(z.literal(''))
).max(1),
```

### Data flow

1. Bij laden: primaire velden gaan naar form, extra waarden naar state arrays
2. Bij opslaan: combineer primair veld + extra array en stuur naar backend
3. Auto-save werkt ook voor de extra velden

---

## Edge Function Wijzigingen

**Bestand: `supabase/functions/trigger-email-signature/index.ts`**

De webhook payload bevat nu ook de array velden zodat n8n hier gebruik van kan maken.

---

## Samenvatting

| Component | Wijziging |
|-----------|-----------|
| Database | 3 nieuwe JSONB kolommen: `emails`, `phone_numbers`, `locations` |
| Hook | Arrays toevoegen aan interface en queries |
| Formulier | Dynamische UI voor meerdere waarden per type (max 2) |
| Edge Function | Extra velden meesturen in payload |

## Visueel Voorbeeld

```text
+------------------------------------------+
| Email *                                  |
| [jan@bedrijf.nl                    ]     |
| [+] Extra email toevoegen                |
+------------------------------------------+
| Telefoonnummer (optioneel)               |
| [+31 6 12345678                    ]     |
| [+] Extra telefoonnummer toevoegen       |
+------------------------------------------+
| Plaatsnaam (optioneel)                   |
| [Amsterdam                         ]     |
| [+] Extra plaatsnaam toevoegen           |
+------------------------------------------+
```

Na toevoegen van extra waarden (max bereikt):

```text
+------------------------------------------+
| Email *                                  |
| [jan@bedrijf.nl                    ]     |
|                                          |
| Extra email                              |
| [info@bedrijf.nl               ] [x]     |
+------------------------------------------+
```

## Resultaat

- Gebruikers kunnen tot 2 emails, 2 telefoonnummers en 2 plaatsnamen invoeren
- De eerste waarde blijft het primaire/verplichte veld (alleen email is verplicht)
- Extra velden zijn optioneel en kunnen worden verwijderd
- Auto-save werkt voor alle velden
- Alle waarden worden meegestuurd naar de n8n webhook
