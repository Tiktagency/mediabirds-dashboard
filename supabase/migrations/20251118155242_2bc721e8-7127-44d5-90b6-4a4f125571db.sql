-- Create automation_status table
CREATE TABLE public.automation_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  automation_name TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('active', 'running', 'inactive')),
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_run TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.automation_status ENABLE ROW LEVEL SECURITY;

-- Allow admins to view all automation statuses
CREATE POLICY "Admins can view all automation statuses"
ON public.automation_status
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Service role can manage automation statuses
CREATE POLICY "Service role can manage automation statuses"
ON public.automation_status
FOR ALL
USING (true)
WITH CHECK (true);

-- Enable realtime for automation_status table
ALTER PUBLICATION supabase_realtime ADD TABLE public.automation_status;

-- Insert initial statuses for the three automations
INSERT INTO public.automation_status (automation_name, status, last_updated) VALUES
  ('monday-planning', 'inactive', now()),
  ('seo', 'inactive', now()),
  ('blogs', 'inactive', now());