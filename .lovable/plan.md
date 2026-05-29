## Doel
Het wachtwoord van `hello@tikt.ai` wijzigen naar `testen!!`.

## Aanpak

Wachtwoorden zitten in het beveiligde `auth`-schema en kunnen alleen via de Supabase Admin API worden gewijzigd. Ik maak een eenmalige edge function die dit doet, voer hem 1× uit, en verwijder hem daarna weer.

### Stappen

1. **Edge function `admin-reset-password`** aanmaken (`supabase/functions/admin-reset-password/index.ts`):
   - Gebruikt `SUPABASE_SERVICE_ROLE_KEY` (al beschikbaar).
   - Beveiligd: vereist JWT van een ingelogde super_admin, zodat alleen jij hem kunt aanroepen.
   - Hardcoded target: `hello@tikt.ai` → nieuw wachtwoord `testen!!`.
   - Zoekt user-id op via `auth.admin.listUsers`, en roept dan `auth.admin.updateUserById(id, { password: 'testen!!' })`.

2. **Functie 1× aanroepen** vanuit de chat met `curl` (terwijl jij ingelogd bent als super_admin, gebruik ik je sessie-JWT).

3. **Edge function verwijderen** nadat de reset is bevestigd, zodat het endpoint niet blijft bestaan.

## Resultaat
- Wachtwoord van `hello@tikt.ai` is `testen!!`.
- Geen blijvend admin-endpoint in de codebase.

Let op: `testen!!` is 8 tekens en voldoet aan de minimale lengte, maar het is een zwak en mogelijk gelekt wachtwoord. Als HIBP-bescherming aanstaat kan de reset geweigerd worden — in dat geval moet je een ander wachtwoord kiezen of HIBP tijdelijk uitzetten.
