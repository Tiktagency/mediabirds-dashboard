-- Add cron job for scheduled blog generation
-- Runs every 5 minutes, same as SEO scheduler
SELECT cron.schedule(
  'run-scheduled-blogs-job',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://audrvgrsuleruuspwnhf.supabase.co/functions/v1/run-scheduled-blogs',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1ZHJ2Z3JzdWxlcnV1c3B3bmhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwMzY0OTYsImV4cCI6MjA3NjYxMjQ5Nn0.F5okgZ0WOMDbZ6Uv7bNbSiGnkhMBF4hlXR7tgbw42Hw'
    ),
    body := '{}'::jsonb
  );
  $$
);