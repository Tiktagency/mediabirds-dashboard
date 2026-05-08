
## Analyse van het beveiligingsprobleem

**Huidig probleem**: De frontend haalt via `select('*')` alle kolommen op uit `alt_text_companies`, inclusief `app_password`. Dit wachtwoord komt dan in de browser terecht (zichtbaar in DevTools → Network tab). De `AltTextCompany` interface bevat zelfs `app_password: string | null` als property.

**Hoe het nu werkt:**
1. `AltTextCompanySelector` doet `select('*')` → `app_password` komt naar browser
2. `WordpressAltText.tsx` slaat het op in `selectedCompany.app_password` state
3. Bij "Start" wordt het wachtwoord meegestuurd naar `trigger-alt-text-webhook`
4. De Edge Function stuurt het wachtwoord door naar n8n

**Na de fix:**
1. `AltTextCompanySelector` doet `select('id, name, domain, created_at')` → geen wachtwoord naar browser
2. `WordpressAltText.tsx` heeft geen `app_password` state/veld meer in de UI
3. Bij "Start" stuurt de frontend alleen `company_id` naar de bestaande `trigger-alt-text-webhook`
4. De Edge Function haalt zelf het wachtwoord op via de service role key

---

## Wijzigingen

### 1. `src/components/wordpress-alt-text/AltTextCompanySelector.tsx`
- `select('*')` → `select('id, name, domain, created_at')` op alle queries (fetchCompanies + handleDeleteCompany)
- `AltTextCompany` interface: `app_password` verwijderen
- `insert` bij toevoegen: `app_password` blijft wél als parameter want we moeten het opslaan, maar we sturen het op als aparte write-only write (insert werkt via de server RLS, geen read nodig)

  > Opmerking: insert vereist dat de client het wachtwoord eenmalig verstuurt bij **aanmaken** — dit is onvermijdelijk. Het gaat erom dat het niet meer teruggelezenwordt door de frontend.

### 2. `src/pages/WordpressAltText.tsx`
- `editPassword` state + wachtwoordveld verwijderen uit de UI (gebruiker kan het bij aanmaken zetten, daarna niet meer inzien/bewerken via de pagina)
- Validatie voor "Start" knop: wachtwoord check verwijderen (`!editPassword.trim()`)
- `handleStart`: stuur `company_id` in plaats van `app_password` naar de Edge Function
- `handleFieldSave` voor `app_password`: verwijderen (wachtwoord is niet meer bewerkbaar)

### 3. `supabase/functions/trigger-alt-text-webhook/index.ts`
- Body verwacht nu `{ company_id, bedrijfsnaam, domain }` (geen `app_password` meer)
- Voeg server-side lookup toe: `supabaseAdmin.from('alt_text_companies').select('app_password').eq('id', company_id).single()` → haalt wachtwoord op via service role key
- Stuur dan `{ bedrijfsnaam, domain, app_password }` naar de n8n webhook zoals nu

### Wat NIET verandert
- `run-scheduled-alt-text` Edge Function: haalt al server-side het wachtwoord op via service role — is al veilig
- Het opslaan van een wachtwoord bij **aanmaken** van een nieuw bedrijf blijft via de client (write-only, RLS staat insert toe voor admins)
- De n8n webhook ontvangt nog steeds het wachtwoord — dat is correct, want n8n heeft het nodig voor de WordPress API-aanroep

### RLS aanpassing (aanbevolen, optioneel maar versterkt de beveiliging)
De huidige RLS policy voor `alt_text_companies` op SELECT geeft `*` terug. Dit is niet beperkt op kolomniveau in PostgreSQL RLS. De beveiliging wordt afgedwongen door in de query-code nooit `app_password` te selecteren.

---

## Bestanden die worden aangepast
- `src/components/wordpress-alt-text/AltTextCompanySelector.tsx`
- `src/pages/WordpressAltText.tsx`
- `supabase/functions/trigger-alt-text-webhook/index.ts`
