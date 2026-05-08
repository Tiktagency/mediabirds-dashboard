-- Create blog_settings table for persistent blog configuration per company
CREATE TABLE public.blog_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  bedrijfsnaam TEXT,
  bedrijfsomschrijving TEXT,
  schrijfstijl TEXT,
  aantal_woorden INTEGER,
  taal TEXT,
  afbeelding_prompt TEXT,
  get_afbeelding_url TEXT,
  post_blog_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(company_id)
);

-- Enable Row Level Security
ALTER TABLE public.blog_settings ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view blog settings
CREATE POLICY "Authenticated users can view blog settings"
  ON public.blog_settings FOR SELECT
  USING (true);

-- Only admins can insert blog settings
CREATE POLICY "Admins can insert blog settings"
  ON public.blog_settings FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Only admins can update blog settings
CREATE POLICY "Admins can update blog settings"
  ON public.blog_settings FOR UPDATE
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Only admins can delete blog settings
CREATE POLICY "Admins can delete blog settings"
  ON public.blog_settings FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at
CREATE TRIGGER update_blog_settings_updated_at
  BEFORE UPDATE ON public.blog_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();