## Doel
Voor het account `luc.degraag@student.hu.nl` (demo) moeten **alle knoppen die een webhook/edge-function aanroepen** volledig uitgeschakeld zijn — niet alleen visueel grijs, maar daadwerkelijk niet klikbaar, met de tooltip "Demo-account: actie niet toegestaan".

De vorige ronde heeft de meeste trigger-knoppen al gedaan. Deze ronde sluit alle resterende gaten.

## Audit: nog te blokkeren knoppen

### 1. Schedule-toggles (zetten automation aan/uit → triggert run-scheduled-* webhooks)
- `src/components/seo/ScheduleTrigger.tsx` — schedule toggle (SEO + Blog)
- `src/hooks/useNewsletterSchedule.ts` consumers in `Nieuwsbrief.tsx`
- `src/hooks/useAltTextSchedule.ts` consumers in `WordpressAltText.tsx`
- `src/hooks/useLandingSchedule.ts` consumers in `Landingspagina.tsx`
- `src/hooks/useBlogSchedule.ts` consumers in `SeoBlog.tsx`
- `src/hooks/useSeoSchedule.ts` consumers

### 2. Admin-panel knoppen die webhooks/edge-functions raken
- `src/components/admin/users/InviteUserModal.tsx` → `invite-user`
- `src/components/admin/users/UserList.tsx` → `manage-user-roles` (rol wijzigen / verwijderen)
- `src/components/admin/automation/StatusToggle.tsx` → `update-automation-status`
- `src/components/seo/CompanySelector.tsx` (bedrijf toevoegen/verwijderen) → `trigger-add-company-webhook`, `trigger-delete-company-webhook`
- Idem in `NewsletterCompanySelector.tsx`, `LandingCompanySelector.tsx`, `AltTextCompanySelector.tsx`
- `src/components/seo-blog/CategoryManager.tsx` (indien webhook)

### 3. Overige trigger-knoppen
- `src/pages/CopyrightBranding.tsx` — startknop (gebruikt `rewrite-text`)
- `src/components/ChatWidget.tsx` / `src/pages/Chatbot.tsx` — verstuur-knop (indien webhook/AI gateway)
- `src/components/seo/CompanyOverviewDialog.tsx` — eventuele save/trigger acties

### 4. Edge-functions die nog een server-side `is_demo_user` guard missen
- `invite-user`
- `manage-user-roles`
- `update-automation-status`
- `trigger-add-company-webhook`
- `trigger-delete-company-webhook`
- `rewrite-text` (controleren of guard er staat)
- `run-scheduled-blogs`, `run-scheduled-seo`, `run-scheduled-newsletters`, `run-scheduled-alt-text`, `run-scheduled-landing` — deze draaien via cron, dus alleen relevant als demo-user ze handmatig zou aanroepen; toch guard toevoegen voor de zekerheid wanneer aangeroepen met user-JWT.

## Aanpak

1. **Centrale helper uitbreiden** — `src/hooks/useIsDemoUser.ts` exporteert al `isDemo` + `DEMO_TOOLTIP`. Geen wijziging nodig.

2. **Generieke wrapper** — kleine helper component `DemoLockButton` of simpelweg overal `disabled={existing || isDemo}` + `title={isDemo ? DEMO_TOOLTIP : ''}` toevoegen. Houden we consistent met de bestaande aanpak.

3. **Per bestand** de knop/toggle uitschakelen wanneer `isDemo === true`. Bij toggles: ook `onCheckedChange` no-op maken wanneer demo.

4. **Edge-functions** — in elke functie uit lijst (4) hetzelfde guard-blok toevoegen dat al in `trigger-newsletter-webhook` en `trigger-email-signature` staat:
   ```ts
   const { data: isDemo } = await supabase.rpc('is_demo_user', { _user_id: user.id });
   if (isDemo) return new Response(JSON.stringify({ error: 'Demo-account: actie niet toegestaan' }),
     { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
   ```

5. **Visuele badge** — kleine "Demo (alleen lezen)" badge in `DashboardButton`/header zodat Luc en bezoekers zien dat ze in demo-modus zitten. (Was al in originele plan, nog niet uitgevoerd.)

## Resultaat
Geen enkele webhook of edge-function kan vanuit het account van Luc worden getriggerd — niet via UI (knoppen zijn `disabled` met tooltip), niet via directe netwerk-calls (edge-functions retourneren 403). Alle leesfuncties en navigatie blijven werken.
