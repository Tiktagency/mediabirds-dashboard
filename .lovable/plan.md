# Demo-modus per automatisering

Voor het demo-account (`luc.degraag@student.hu.nl`, `profiles.is_demo = true`) moet het gedrag per automatisering verschillen. Andere accounts blijven ongewijzigd.

## Gewenste matrix

| Automatisering | Demo-gedrag |
|---|---|
| Email handtekening | **Echt uitvoeren** (webhook + opslaan) |
| Copyright branding | **Echt uitvoeren** (AI-call) |
| Monday planning | Simuleren: knop werkt, progressbalk loopt, geen webhook |
| SEO – Keyword research | Simuleren |
| SEO – Blog generation | Simuleren |
| SEO – Pagina URL | Simuleren |
| WordPress Alt-text (handmatig) | Simuleren |
| Landingspagina | Simuleren |
| Nieuwsbrief (alle 3 knoppen: kleuren, info, generate) | Simuleren |
| Leads generator | Simuleren |

Bij "Simuleren" laat de UI de bestaande progressbalk normaal lopen tot de verwachte duur, toont daarna een succesmelding en doet **geen** edge-function/webhook-call.

## Aanpak

### 1. Edge functions: sta demo toe voor 2 uitzonderingen
- `supabase/functions/trigger-email-signature/index.ts`: verwijder de `is_demo_user` 403-blokkade.
- `supabase/functions/rewrite-text/index.ts`: verwijder de `is_demo_user` 403-blokkade.
- Alle andere `trigger-*` edge functions blijven 403 geven voor demo (extra veiligheidsslot — frontend roept ze toch niet meer aan).

### 2. Frontend helper
Nieuwe util `src/lib/demoSimulation.ts`:
```ts
export const simulateAutomation = (durationSec: number) =>
  new Promise<void>(resolve => setTimeout(resolve, durationSec * 1000));
```
Geeft een belofte die na `duration` seconden resolved, zodat de bestaande `progress.start()` → `await` → `progress.complete()` flow ongewijzigd blijft.

### 3. Per-page integratie
In elk van de te simuleren bestanden:
- `useIsDemoUser()` is daar veelal al beschikbaar (of importeer hem).
- In de handler: vóór de `supabase.functions.invoke(...)` aanroep, check `if (isDemo) { await simulateAutomation(AUTOMATION_DURATIONS.x); /* success-toast */ progress.complete(); return; }`.
- De knop wordt **niet** meer disabled voor demo (verwijder `disabled={isDemo}` en `DEMO_TOOLTIP` op deze knoppen — behalve voor knoppen die we sowieso geblokkeerd willen houden, hier geen).

Te wijzigen bestanden:
- `src/pages/MondayPlanning.tsx`
- `src/pages/LeadsGenerator.tsx`
- `src/pages/WordpressAltText.tsx`
- `src/pages/Landingspagina.tsx`
- `src/pages/Nieuwsbrief.tsx` (3 knoppen)
- `src/components/seo-blog/KeywordResearchForm.tsx`
- `src/components/seo-blog/BlogGenerationForm.tsx`
- `src/components/seo-blog/PageUrlForm.tsx`

### 4. Email signature & Copyright branding
- `src/components/email-signature/EmailSignatureForm.tsx` en `src/components/copyright-branding/CopyrightBrandingForm.tsx`: verwijder demo-disable op de submit-knop zodat demo-user volledig kan gebruiken (inclusief opslaan).
- Als deze pagina's verder demo-checks doen (bv. `useIsDemoUser` om iets uit te schakelen), die weghalen.

### 5. Geen wijzigingen aan
- Dashboard tiles / opslag (al per-demo gescheiden via eerdere sync-dashboard-settings aanpassing).
- Schedule/auto-runs (demo had/krijgt geen scheduling).
- Admin-panel zichtbaarheid.

## Memory-update
Bestaand memory `mem://features/demo-account` (of toevoegen indien afwezig) uitbreiden met:
"Demo (luc.degraag@student.hu.nl): email-handtekening en copyright-branding draaien echt; overige automatiseringen worden in de frontend gesimuleerd via `simulateAutomation()` met `AUTOMATION_DURATIONS`, geen webhook-call."
