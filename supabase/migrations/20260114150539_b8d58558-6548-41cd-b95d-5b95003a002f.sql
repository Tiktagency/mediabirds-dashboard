-- Create blog_schedules table for automatic blog generation scheduling
CREATE TABLE public.blog_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT false,
  frequency TEXT NOT NULL DEFAULT 'weekly',
  day_of_week INTEGER NOT NULL DEFAULT 1,
  time_of_day TIME NOT NULL DEFAULT '10:00:00',
  last_triggered_at TIMESTAMPTZ,
  next_trigger_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id)
);

-- Enable RLS
ALTER TABLE public.blog_schedules ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Admins can manage blog schedules"
  ON public.blog_schedules
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can view blog schedules"
  ON public.blog_schedules
  FOR SELECT
  USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_blog_schedules_updated_at
  BEFORE UPDATE ON public.blog_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add pg_cron job for scheduled blogs (runs every 5 minutes)
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