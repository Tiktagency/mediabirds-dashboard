## Probleem
Als iemand het project via de GitHub-URL opent (bijv. na een fresh clone of een nieuwe omgeving), krijgt de gebruiker een zwart scherm. Oorzaak: de Supabase-client leest `VITE_SUPABASE_URL` en `VITE_SUPABASE_PUBLISHABLE_KEY` uit `.env`, maar `.env` staat in `.gitignore`. Zonder deze variabelen crasht `createClient` direct → lege/zwarte pagina.

## Oplossing
`.env` verwijderen uit `.gitignore` zodat de door Lovable Cloud beheerde credentials meegaan naar elke omgeving die vanaf de repo start.

### Stappen
1. In `.gitignore` regel 27 (`.env`) verwijderen. `.env.local` en `.env.*.local` blijven wél genegeerd (voor lokale secrets).
2. Lovable regenereert het `.env`-bestand met de publieke publishable key + URL zodat het nu in de repo terechtkomt.
3. Republish daarna zodat de live URL een werkende build heeft.

Geen andere codewijzigingen nodig — de client en env-namen kloppen al.
