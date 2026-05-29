## Probleem

De auth-tabel bevat alleen `hello@tikt.ai` (id `858fbdeb-…`). Er is **geen auth-account** voor `luc.degraag@student.hu.nl`. Daarom faalt elke login voor Luc met "Invalid login credentials" (zie auth-logs), en lijkt het alsof "de één werkt en de ander niet" — in werkelijkheid bestaat Luc gewoon niet meer als inlogbaar account.

Het wachtwoord op het ene account aanpassen heeft logischerwijs geen effect op het andere; ze moeten allebei los bestaan en allebei het wachtwoord `AfstuDeErProJect!` accepteren.

## Oplossing

Een tijdelijke admin-edge-function (`admin-ensure-luc-user`) draaien die via de Supabase Admin API:

1. Controleert of er een auth-user bestaat met e-mail `luc.degraag@student.hu.nl`.
2. **Bestaat niet** → aanmaken met:
   - email: `luc.degraag@student.hu.nl`
   - password: `AfstuDeErProJect!`
   - `email_confirm: true` (geen verificatie-mail nodig)
   - De bestaande `handle_new_user` trigger zet het profiel automatisch op `is_demo = true` (matcht op e-mail) — Luc blijft dus demo-account.
3. **Bestaat al** → password resetten naar `AfstuDeErProJect!` en `email_confirm: true` forceren.
4. Daarnaast nogmaals het wachtwoord van `hello@tikt.ai` (id `858fbdeb-…`) op `AfstuDeErProJect!` zetten, zodat beide accounts gegarandeerd hetzelfde wachtwoord hebben.
5. Controleer dat `profiles.is_demo` correct staat:
   - Luc → `true`
   - hello@tikt.ai → `false` (al ingesteld vorige sessie, voor de zekerheid herzetten)

Daarna een snelle validatie via `supabase auth /token` voor beide accounts met `AfstuDeErProJect!`, en de tijdelijke edge function + config-block direct weer verwijderen (zelfde patroon als vorige reparaties).

## Bestanden

- `supabase/functions/admin-ensure-luc-user/index.ts` — tijdelijk aangemaakt, na succes verwijderd.
- `supabase/config.toml` — tijdelijk function-block toegevoegd, na cleanup hersteld.

Geen frontend-, schema- of permanente backendwijzigingen.

## Resultaat

Beide accounts loggen onafhankelijk in met `AfstuDeErProJect!`:
- `hello@tikt.ai` → super_admin, volle functionaliteit (geen demo).
- `luc.degraag@student.hu.nl` → demo-account, knoppen blijven uitgeschakeld, ziet de vaste 75,2 uur in de Bespaard-tegel.
