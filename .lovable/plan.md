

## Applicatie wachtwoord toevoegen bij bedrijf (beveiligd)

### Probleem
Bij het toevoegen van een alt-tekst bedrijf wordt er geen WordPress applicatie wachtwoord opgeslagen. Dit wachtwoord is nodig voor de webhook om te authenticeren bij de WordPress API.

### Oplossing
Een beveiligde `app_password` kolom toevoegen aan de `alt_text_companies` tabel en het wachtwoord meesturen naar de webhook bij zowel handmatige als automatische triggers.

### Beveiliging
- De kolom is beschermd door de bestaande RLS-policies: alleen admins en super_admins kunnen de tabel lezen/schrijven
- In de UI wordt het wachtwoord getoond als password-veld (dots) en nooit in plain text
- Het wachtwoord wordt alleen server-side doorgestuurd naar de webhook via edge functions

### Aanpassingen

**1. Database migratie**
- Kolom `app_password` (text, nullable) toevoegen aan `alt_text_companies`

**2. `src/components/wordpress-alt-text/AltTextCompanySelector.tsx`**
- Nieuw state veld `newCompanyPassword` toevoegen
- Extra input veld (type="password") in de "Nieuw bedrijf toevoegen" dialog
- Het wachtwoord meesturen bij de insert
- Interface `AltTextCompany` uitbreiden met `app_password`

**3. `src/pages/WordpressAltText.tsx`**
- Bewerkbaar wachtwoord-veld toevoegen naast bedrijfsnaam en domeinnaam
- Wachtwoord tonen als `type="password"` input
- Opslaan via dezelfde edit-flow als naam en domein

**4. `supabase/functions/trigger-alt-text-webhook/index.ts`**
- Het `app_password` veld ophalen uit de database voor het geselecteerde bedrijf
- Meesturen als `app_password` in de webhook payload

**5. `supabase/functions/run-scheduled-alt-text/index.ts`**
- Het `app_password` veld meelezen bij het ophalen van bedrijven
- Per bedrijf het wachtwoord meesturen in de webhook payload

