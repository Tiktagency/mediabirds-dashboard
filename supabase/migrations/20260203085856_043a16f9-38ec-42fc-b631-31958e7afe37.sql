-- Create app_settings table for global configuration
CREATE TABLE public.app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read settings
CREATE POLICY "Anyone can read settings" ON public.app_settings
  FOR SELECT TO authenticated USING (true);

-- Only super_admin can update settings
CREATE POLICY "Super admins can update settings" ON public.app_settings
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

-- Insert initial value
INSERT INTO public.app_settings (key, value) 
VALUES ('seo_guide_title', 'SEO blog handleiding');