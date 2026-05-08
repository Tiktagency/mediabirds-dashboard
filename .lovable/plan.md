
# Plan: Gegenereerde HTML Opslaan

## Probleem

Wanneer een gebruiker een email handtekening genereert en vervolgens de pagina verlaat, gaat de gegenereerde HTML code en preview verloren. De gebruiker moet dan de handtekening opnieuw genereren.

---

## Oplossing

Sla de gegenereerde HTML op in de database bij de handtekening-instellingen, zodat deze automatisch wordt geladen wanneer de gebruiker terugkeert naar de pagina.

---

## Technische Wijzigingen

### 1. Database Migratie

Voeg een nieuwe kolom toe aan de `email_signature_settings` tabel:

```sql
ALTER TABLE email_signature_settings 
ADD COLUMN generated_html TEXT DEFAULT NULL;
```

### 2. Hook Aanpassen (`src/hooks/useEmailSignatureSettings.ts`)

**Interface uitbreiden:**
```typescript
export interface EmailSignatureSettings {
  // ... bestaande velden
  generated_html: string | null;  // NIEUW
}
```

**Parse functie updaten:**
- `generated_html` toevoegen aan de `parseSignature` functie

**Save functie updaten:**
- `generated_html` parameter toevoegen aan de `saveSettings` functie
- Dit veld meenemen in zowel INSERT als UPDATE queries

### 3. Pagina Aanpassen (`src/pages/EmailSignature.tsx`)

**HTML laden bij selectie:**
- Wanneer `selectedSignature` verandert, de opgeslagen `generated_html` laden in de state

**HTML opslaan na generatie:**
- Na succesvolle webhook response, de HTML opslaan via een aparte update functie

### 4. Formulier Aanpassen (`src/components/email-signature/EmailSignatureForm.tsx`)

**Callback uitbreiden:**
- `onHtmlGenerated` callback aanroepen met de gegenereerde HTML
- De parent component slaat dit vervolgens op

---

## Dataflow

```
1. Gebruiker genereert handtekening
   ↓
2. Webhook retourneert HTML
   ↓
3. HTML wordt getoond in preview + opgeslagen in database
   ↓
4. Gebruiker verlaat pagina
   ↓
5. Gebruiker keert terug
   ↓
6. Opgeslagen HTML wordt geladen en getoond
```

---

## Resultaat

- Gegenereerde HTML blijft behouden na het verlaten van de pagina
- Preview wordt direct getoond bij het selecteren van een bestaande handtekening
- HTML code is meteen beschikbaar om te kopiëren
