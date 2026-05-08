-- Create seo_schedules table for automatic trigger configuration
CREATE TABLE public.seo_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE UNIQUE,
  enabled BOOLEAN NOT NULL DEFAULT false,
  frequency TEXT NOT NULL DEFAULT 'weekly',
  day_of_week INTEGER NOT NULL DEFAULT 1,
  time_of_day TIME NOT NULL DEFAULT '10:00:00',
  last_triggered_at TIMESTAMPTZ,
  next_trigger_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.seo_schedules ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage seo schedules"
ON public.seo_schedules
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can view seo schedules"
ON public.seo_schedules
FOR SELECT
USING (true);

-- Update trigger for updated_at
CREATE TRIGGER update_seo_schedules_updated_at
BEFORE UPDATE ON public.seo_schedules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();