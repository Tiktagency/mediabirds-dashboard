
-- Create landing_schedules table
CREATE TABLE public.landing_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT false,
  interval_value INTEGER NOT NULL DEFAULT 1,
  interval_unit TEXT NOT NULL DEFAULT 'weeks',
  day_of_week INTEGER NOT NULL DEFAULT 1,
  time_of_day TIME NOT NULL DEFAULT '10:00:00',
  last_triggered_at TIMESTAMPTZ,
  next_trigger_at TIMESTAMPTZ,
  last_processed_company_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.landing_schedules ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Admins can manage landing schedules"
ON public.landing_schedules FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Authenticated users can view landing schedules"
ON public.landing_schedules FOR SELECT
USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_landing_schedules_updated_at
BEFORE UPDATE ON public.landing_schedules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
