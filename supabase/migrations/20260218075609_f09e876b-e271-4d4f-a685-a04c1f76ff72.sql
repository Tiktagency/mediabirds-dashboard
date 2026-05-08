
CREATE TABLE public.alt_text_companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.alt_text_companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view alt text companies"
ON public.alt_text_companies
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Admins can insert alt text companies"
ON public.alt_text_companies
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Admins can update alt text companies"
ON public.alt_text_companies
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can delete alt text companies"
ON public.alt_text_companies
FOR DELETE
USING (has_role(auth.uid(), 'super_admin'::app_role));
