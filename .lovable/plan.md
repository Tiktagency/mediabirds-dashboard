# Plan: Uniforme progress bar voor alle automatiseringen

## Doel
Bij iedere automatisering een progress bar tonen die loopt van het moment dat de gebruiker op de start-knop klikt tot het moment dat de webhook/edge function een respons teruggeeft. Geen enkele knop mag direct "gestart" tonen — er wordt altijd op de werkelijke respons gewacht.

## Huidige situatie (audit)
Alle 10 triggers roepen de edge function/webhook al **synchroon** aan (`await`). Alleen **LeadsGenerator** heeft al een echte progress bar (`<Progress>` die in 300s van 0 → 100% loopt). De overige automatiseringen tonen alleen een spinner of "Bezig..." in de knop.

| Automatisering | Huidige feedback | Verwachte duur |
|---|---|---|
| Monday Planning | Spinner | ~30s |
| SEO – Keyword Research | Knop disabled | ~60s |
| SEO – Blog Generatie | Spinner + tekst "enkele minuten" | ~240s |
| SEO – Pagina URL | Knop disabled (10 min timeout) | ~300s |
| WordPress Alt-text | Spinner + AltTextAnimation | ~120s |
| Copyright Branding | Spinner + result skeleton | ~30s |
| E-mail Handtekening | Spinner + preview "laden..." | ~45s |
| Landingspagina | Spinner + AltTextAnimation | ~180s |
| Nieuwsbrief – Generatie | Spinner (loopt soms tegen 524) | ~180s |
| Nieuwsbrief – Brand Colors | Spinner | ~20s |
| Nieuwsbrief – Company Info | Spinner | ~30s |
| Leads Generator | ✅ Progress bar (300s) | 300s — referentie |

Chatbot (iframe) krijgt geen bar.

## Aanpak

### 1. Herbruikbare hook + component
Nieuwe bestanden:

- `src/hooks/useAutomationProgress.ts` — start/stop/reset, ticker (~10 updates/sec), snapt naar 100% bij succes, naar 0% bij fout/abort. Cap bij 99% tot respons binnen is, zodat we geen onterecht "klaar" tonen.
- `src/components/automation/AutomationProgressBar.tsx` — wrapper rond shadcn `<Progress>` + tijd-label ("0:42 / ~2:00") + statuskleur (lopend, succes, fout). Themed via design tokens (semantische kleuren), geen hardcoded hex.

### 2. Integratie per pagina
Per trigger:
1. Hook starten op klik (`start(expectedDurationSec)`).
2. `await supabase.functions.invoke(...)` of `await fetch(...)`.
3. Bij succes/fout: `complete()` of `fail()`. Bar verdwijnt 1s na 100%.
4. Bestaande spinners in knop blijven (uitsluitend als "knop is bezig"-signaal); de bar komt eronder of in het resultaatpaneel.

Toe te passen in:
- `src/pages/MondayPlanning.tsx`
- `src/components/seo-blog/KeywordResearchForm.tsx`
- `src/components/seo-blog/BlogGenerationForm.tsx`
- `src/components/seo-blog/PageUrlForm.tsx`
- `src/pages/WordpressAltText.tsx`
- `src/components/copyright-branding/CopyrightBrandingForm.tsx`
- `src/components/email-signature/EmailSignatureForm.tsx`
- `src/pages/Landingspagina.tsx`
- `src/pages/Nieuwsbrief.tsx` (3 knoppen: generatie, brand colors, company info)

LeadsGenerator wordt gerefactord zodat hij dezelfde hook/component gebruikt (i.p.v. zijn eigen `setInterval`-logica).

### 3. Echte wachttijd afdwingen
Voor de triggers die nu wél `await`-en maar waar de gebruiker de indruk had dat de melding direct verscheen (Monday Planning, WP Alt-text, Landingspagina): de succes-toast wordt verplaatst naar **na** de `await`. Audit bevestigt dat alle calls al synchroon zijn, dus dit is voornamelijk verifiëren + waar nodig de toast-tekst aanpassen van "gestart" naar "voltooid".

### 4. Demo-modus
Bestaande `disabled={isDemo}` gedrag blijft. Progress bar wordt nooit zichtbaar voor demo-accounts omdat de trigger niet doorloopt.

## Verwachte duren (defaults)
Standaardwaarden in een constante `AUTOMATION_DURATIONS` zodat ze per automatisering eenvoudig aan te passen zijn. Bij overschrijden van de verwachte duur blijft de bar bij 99% staan tot respons.

## Buiten scope
- Geen wijzigingen aan edge functions / webhooks zelf.
- Geen wijzigingen aan dashboard-tegels of routing.
- Chatbot iframe ongewijzigd.

## Open vraag
De geschatte duren hierboven zijn inschattingen. Als je exacte P90-waarden hebt per automatisering, pas ik `AUTOMATION_DURATIONS` daarop aan. Anders gebruik ik bovenstaande defaults en kun je ze later in één bestand bijstellen.
