CREATE TABLE public.landing_companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  domain text,
  app_password text,
  spreadsheet_id text,
  grid_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.landing_companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view landing companies"
  ON public.landing_companies FOR SELECT
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can insert landing companies"
  ON public.landing_companies FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can update landing companies"
  ON public.landing_companies FOR UPDATE
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can delete landing companies"
  ON public.landing_companies FOR DELETE
  USING (has_role(auth.uid(), 'super_admin'));