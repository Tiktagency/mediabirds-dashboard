CREATE TABLE public.newsletter_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.newsletter_companies(id) ON DELETE CASCADE,
  enabled boolean NOT NULL DEFAULT false,
  interval_value integer NOT NULL DEFAULT 1,
  interval_unit text NOT NULL DEFAULT 'weeks',
  frequency text NOT NULL DEFAULT 'weekly',
  day_of_week integer NOT NULL DEFAULT 1,
  time_of_day time without time zone NOT NULL DEFAULT '10:00:00'::time without time zone,
  last_triggered_at timestamp with time zone,
  next_trigger_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT newsletter_schedules_company_id_key UNIQUE (company_id)
);

ALTER TABLE public.newsletter_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage newsletter schedules"
  ON public.newsletter_schedules
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Authenticated users can view newsletter schedules"
  ON public.newsletter_schedules
  FOR SELECT
  USING (true);

CREATE TRIGGER update_newsletter_schedules_updated_at
  BEFORE UPDATE ON public.newsletter_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();