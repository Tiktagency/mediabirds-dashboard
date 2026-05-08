

## Cron job toevoegen voor Alt-tekst automatische trigger

### Probleem

De edge function `run-scheduled-alt-text` bestaat en werkt correct, maar er is geen cron job die hem aanroept. Bij SEO en Blogs draait er elke 5 minuten een cron job via `pg_cron` + `pg_net` -- voor alt-tekst ontbreekt dit volledig. Daarom gebeurt er niets op het geplande tijdstip.

### Oplossing

Een cron job aanmaken die elke 5 minuten de edge function `run-scheduled-alt-text` aanroept, identiek aan de bestaande SEO en Blog cron jobs.

### Aanpassing

**Database (SQL via Run SQL)**:

```sql
SELECT cron.schedule(
  'run-scheduled-alt-text-job',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://audrvgrsuleruuspwnhf.supabase.co/functions/v1/run-scheduled-alt-text',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1ZHJ2Z3JzdWxlcnV1c3B3bmhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwMzY0OTYsImV4cCI6MjA3NjYxMjQ5Nn0.F5okgZ0WOMDbZ6Uv7bNbSiGnkhMBF4hlXR7tgbw42Hw'
    ),
    body := '{}'::jsonb
  );
  $$
);
```

Dit zorgt ervoor dat elke 5 minuten wordt gecheckt of er een alt-tekst trigger "due" is. De edge function zelf controleert vervolgens of `next_trigger_at` is verstreken voordat hij daadwerkelijk een bedrijf verwerkt.

Daarnaast wordt de `next_trigger_at` geüpdatet naar een toekomstig tijdstip zodat de trigger alsnog correct afloopt bij de eerstvolgende check.
