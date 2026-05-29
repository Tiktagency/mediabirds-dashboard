## Probleem

Op het loginscherm verschijnt rechtsonder de toast **"Fout — Kon automation instelling niet laden"**.

### Oorzaak
- `src/pages/Index.tsx` (route `/`) gebruikt `useAutomationSettings()`.
- Wanneer een uitgelogde gebruiker `/` bezoekt, mount `Index` heel kort voordat `useAuth` doorstuurt naar `/login`.
- In die korte tijd vuurt `useAutomationSettings` zijn `SELECT` op `automation_settings`. RLS staat dat alleen toe voor admins → query faalt → `toast({ variant: 'destructive', ... 'Kon automation instellingen niet laden' })` blijft zichtbaar op de loginpagina.

## Oplossing

Eén kleine wijziging in `src/hooks/useAutomationSettings.ts`:

1. Eerst checken of er een actieve sessie is via `supabase.auth.getSession()` voordat de query wordt gedaan. Geen sessie → niets fetchen, geen toast, `isLoading` op `false` zetten.
2. Luisteren naar `supabase.auth.onAuthStateChange`: zodra de gebruiker inlogt, alsnog de settings ophalen (zodat het dashboard direct na login werkt).
3. Bij een echte permissiefout (ingelogde niet-admin) blijft de toast onderdrukt — die rol heeft sowieso niets aan deze data. Foutmelding alleen tonen bij onverwachte fouten voor admins.

Geen wijzigingen aan RLS, edge functions of andere hooks; alleen het frontend-gedrag van deze hook.

## Resultaat
- Loginscherm toont geen valse foutmelding meer.
- Dashboard laadt automation-instellingen normaal zodra een admin is ingelogd.
