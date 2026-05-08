
## Analyse: Wat vertraagt het project?

### Huidige knelpunten op de Index pagina

**Parallelle waterval van DB-queries bij opstarten:**
- `useAuth` — 2x rollen ophalen (getSession + onAuthStateChange)
- `useDashboardSettings` — apart `getUser()` + dashboard query
- `useAutomationSettings` — automation_settings query
- `useAutomationStatus` — automation_status query + realtime channel
- `useN8nExecutions` × 3 — 3 aparte edge function calls (chatbot, monday, alttext)
- Index.tsx zelf — nog een `profiles` query voor complete-profile check

**Totaal: ~8 aparte netwerkaanvragen serieel/overlappend bij eerste load.**

De pagina toont een spinner zolang `isLoading || settingsLoading || automationsLoading` — dus de gebruiker ziet niets totdat alle drie klaar zijn.

### Plan: Compactere, snellere architectuur

**1. Parallelle queries samenvoegen in `useAuth`**
`getSession()` + rollen ophalen dubbel (zowel in getSession als in onAuthStateChange). Deduplicate: één fetch bij initiële sessie, onAuthStateChange alleen voor daadwerkelijke auth-wijzigingen.

**2. Skeleton UI i.p.v. volledige spinner**
Dashboard laadt direct met skeleton tiles, zodat de gebruiker meteen iets ziet. Zware data (n8n executions) laadt op de achtergrond.

**3. `useN8nExecutions` samenvoegen tot één call**
Nu 3 aparte edge function calls. Eén gecombineerde call die alle 3 workflows tegelijk ophaalt.

**4. `useDashboardSettings` — verwijder dubbele `getUser()`**
Haalt `user` op via `supabase.auth.getUser()` intern, terwijl `useAuth` dit al doet. Geef de `user` door als parameter.

**5. Index.tsx: `profiles` query buiten de kritieke render-path**
De `showCompleteProfile` check blokkeert niets maar veroorzaakt wel een extra query. Dit kan na de eerste render.

### Concrete wijzigingen

| Bestand | Aanpassing |
|---|---|
| `src/hooks/useAuth.ts` | Dedupliceer rollen-fetch, verwijder dubbele getSession/onAuthStateChange logica |
| `src/hooks/useN8nExecutions.ts` | Meerdere workflows in één edge function call |
| `supabase/functions/get-n8n-executions/index.ts` | Accepteer array van workflowNames |
| `src/pages/Index.tsx` | Skeleton loading i.p.v. volledige spinner, `useN8nExecutions` één keer aanroepen |
| `src/hooks/useDashboardSettings.ts` | Accepteer optionele `userId` om dubbele `getUser()` te vermijden |

### Niet aanraken
- Alle feature-logica, automations, UI components
- Supabase queries met RLS (die zijn correct)
- `useAutomationStatus` realtime channel (werkt goed)
