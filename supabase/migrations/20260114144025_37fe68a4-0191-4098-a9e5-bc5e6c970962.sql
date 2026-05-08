-- Enable required extensions for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Schedule the run-scheduled-seo function to run every 5 minutes
SELECT cron.schedule(
  'run-scheduled-seo-job',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://audrvgrsuleruuspwnhf.supabase.co/functions/v1/run-scheduled-seo',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1ZHJ2Z3JzdWxlcnV1c3B3bmhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwMzY0OTYsImV4cCI6MjA3NjYxMjQ5Nn0.F5okgZ0WOMDbZ6Uv7bNbSiGnkhMBF4hlXR7tgbw42Hw'
    ),
    body := '{}'::jsonb
  );
  $$
);