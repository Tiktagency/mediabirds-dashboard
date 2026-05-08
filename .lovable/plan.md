
## Automatische trigger voor Nieuwsbrief

Volledig analoog aan de blog trigger. Wat nodig is:

### 1. Database migratie — nieuwe tabel `newsletter_schedules`
Zelfde structuur als `blog_schedules`, maar per `newsletter_companies` bedrijf:
```sql
CREATE TABLE public.newsletter_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  enabled boolean NOT NULL DEFAULT false,
  interval_value integer NOT NULL DEFAULT 1,
  interval_unit text NOT NULL DEFAULT 'weeks',
  day_of_week integer NOT NULL DEFAULT 1,
  time_of_day time NOT NULL DEFAULT '10:00:00',
  last_triggered_at timestamptz,
  next_trigger_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
-- RLS policies (admins manage, authenticated can view)
```

### 2. Nieuwe hook `src/hooks/useNewsletterSchedule.ts`
Exacte kopie van `useBlogSchedule.ts`, maar leest/schrijft uit `newsletter_schedules`.

### 3. Nieuwe edge function `supabase/functions/run-scheduled-newsletters/index.ts`
Analoog aan `run-scheduled-blogs/index.ts`:
- Haalt alle `newsletter_schedules` op die `enabled = true` en `next_trigger_at <= now()`
- Per bedrijf: haalt `newsletter_companies` gegevens op
- Bouwt dezelfde payload als de handmatige knop (alle 8 kleuren + tekstvelden + rss_feeds)
- POST naar dezelfde `NEWSLETTER_WEBHOOK_URL`
- Bij succes: update `last_triggered_at` + `next_trigger_at`, sla HTML op in DB
- Bij fout: schedule niet vooruit zetten (retry)
- `max_duration = 300` in `config.toml`

### 4. Database cron job
Cron die `run-scheduled-newsletters` elke 5 minuten aanroept (via `pg_cron` migratie), zelfde als blog/seo.

### 5. UI in `src/pages/Nieuwsbrief.tsx`
- Importeer `useNewsletterSchedule` + de bestaande `ScheduleTrigger` component
- Voeg een `<ScheduleTrigger>` sectie toe onder de generate-knop (of als aparte kaart)
- `companyId = selectedCompany?.id` — werkt dus per-bedrijf net als blogs
- Genereer-knop uitschakelen met label "Automatische trigger actief" wanneer schedule enabled is (zelfde interlock als blogs)

### Bestanden die wijzigen
- `supabase/migrations/` — nieuwe migratie voor `newsletter_schedules` tabel + cron
- `src/hooks/useNewsletterSchedule.ts` — nieuw
- `supabase/functions/run-scheduled-newsletters/index.ts` — nieuw
- `supabase/config.toml` — `run-scheduled-newsletters` met `verify_jwt = false` + `max_duration = 300`
- `src/pages/Nieuwsbrief.tsx` — ScheduleTrigger integreren + button interlock
