## Doel
Luc (`luc.degraag@student.hu.nl`) krijgt **admin-rechten** (ziet alles, incl. admin panel en alle bedrijfsdata), maar **alle start-/trigger-knoppen worden geblokkeerd** zodat hij niets kan uitvoeren. Zo kun je het account veilig delen om het dashboard te demonstreren.

## Aanpak

### 1. Database
- Kolom `is_demo BOOLEAN DEFAULT false` toevoegen aan `profiles`.
- `is_demo = true` zetten voor Luc.
- Zorgen dat Luc de `admin` rol heeft (indien nog niet).
- RLS op `profiles` blijft zoals het is (gebruiker leest eigen profiel).

### 2. Auth-hook (`src/hooks/useAuth.ts`)
- `isDemo` ophalen uit `profiles` na login en exposen.

### 3. Permissie-hook (`src/hooks/useUserPermissions.ts`)
- Wanneer `isDemo === true`:
  - `canView` blijft `true` (admin-zicht behouden)
  - `canExecute` forceren op `false`
  - `canManage` forceren op `false`
- Zo worden bestaande knoppen die al `canExecute` checken automatisch uitgeschakeld.

### 4. Frontend: knoppen blokkeren
Audit en uitschakelen (disabled + tooltip "Demo-account: uitvoeren niet toegestaan") van alle trigger-knoppen, ook waar nu geen `canExecute` check zit. Te raken componenten/pagina's o.a.:
- `src/pages/SeoBlog.tsx` (Blog generatie + SEO research + Pagina URL webhook + Schedule toggle)
- `src/components/seo-blog/BlogGenerationForm.tsx`, `KeywordResearchForm.tsx`, `PageUrlForm.tsx`
- `src/components/seo/ScheduleTrigger.tsx`
- `src/pages/Nieuwsbrief.tsx` (newsletter generatie + schedule)
- `src/pages/WordpressAltText.tsx` (alt-text trigger + schedule)
- `src/pages/Landingspagina.tsx` (landing trigger + schedule)
- `src/pages/MondayPlanning.tsx` (start knop)
- `src/pages/LeadsGenerator.tsx` (start knop)
- `src/pages/CopyrightBranding.tsx` (start knop)
- `src/pages/EmailSignature.tsx` (signature generatie + opslaan webhook)
- `src/components/admin/...` — admin-panel knoppen die schrijven (bedrijven toevoegen/verwijderen, gebruikers uitnodigen/rol wijzigen, instellingen wijzigen, schedule toggles) → ook geblokkeerd voor demo.
- Beheer-/save-acties die data wijzigen: lezen blijft toegestaan; opslaan en verwijderen geblokkeerd in demo-modus.

Gecentraliseerde helper `useIsDemo()` (uit `useAuth`) zodat we overal consistent `disabled || isDemo` kunnen toevoegen met dezelfde tooltip.

### 5. Server-side hard guard (belangrijk!)
Frontend-disabled is niet genoeg — als de demo-gebruiker echt admin is, kan hij theoretisch via netwerk-call alsnog dingen triggeren. Daarom in elke trigger-edge-function (`trigger-*`, `run-scheduled-*`, `update-automation-status`, `invite-user`, `manage-user-roles`, `trigger-delete-company-webhook`, etc.) aan het begin een check:
```ts
const { data: profile } = await supabase.from('profiles').select('is_demo').eq('id', userId).single();
if (profile?.is_demo) return new Response(JSON.stringify({ error: 'Demo account: actie niet toegestaan' }), { status: 403, headers: corsHeaders });
```
Plus een RLS-policy op schrijvende tabellen die `is_demo` users blokkeert via een security-definer functie `public.is_demo_user(uid)` — zodat directe Supabase-calls vanuit de client ook geweigerd worden.

### 6. Visuele indicatie
Kleine badge "Demo-account (alleen lezen)" rechtsboven in de header zodat het zichtbaar is voor wie ingelogd is.

## Resultaat
Luc logt in met `luc.degraag@student.hu.nl` / `AfstuDeErProJect!`, ziet het volledige dashboard en admin panel, kan rondkijken en instellingen openen, maar elke knop die iets daadwerkelijk start, opslaat, wijzigt of verwijdert is uitgeschakeld — zowel in de UI als server-side afgedwongen.
