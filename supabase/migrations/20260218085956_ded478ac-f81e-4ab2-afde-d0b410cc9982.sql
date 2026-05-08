
-- Global alt-text schedule (single row, no company_id)
CREATE TABLE public.alt_text_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enabled BOOLEAN NOT NULL DEFAULT false,
  interval_value INTEGER NOT NULL DEFAULT 1,
  interval_unit TEXT NOT NULL DEFAULT 'weeks',
  day_of_week INTEGER NOT NULL DEFAULT 1,
  time_of_day TIME NOT NULL DEFAULT '10:00:00',
  last_triggered_at TIMESTAMPTZ,
  next_trigger_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.alt_text_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage alt text schedules"
  ON public.alt_text_schedules FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Authenticated users can view alt text schedules"
  ON public.alt_text_schedules FOR SELECT
  USING (true);
