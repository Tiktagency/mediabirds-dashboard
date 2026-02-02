-- Create page_url_settings table
CREATE TABLE public.page_url_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  google_sheet_id TEXT,
  google_file_id TEXT,
  page_urls JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id)
);

-- Enable RLS
ALTER TABLE public.page_url_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Authenticated users can read page_url_settings"
  ON public.page_url_settings FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert page_url_settings"
  ON public.page_url_settings FOR INSERT TO authenticated 
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update page_url_settings"
  ON public.page_url_settings FOR UPDATE TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_page_url_settings_updated_at
  BEFORE UPDATE ON public.page_url_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();