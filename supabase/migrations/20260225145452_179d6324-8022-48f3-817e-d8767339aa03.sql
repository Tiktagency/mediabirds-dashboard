
CREATE TABLE public.newsletter_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  bedrijfsnaam text,
  bedrijfsinformatie text,
  schrijfstijl text,
  rss_feeds jsonb DEFAULT '[]'::jsonb,
  achtergrond_kleur text DEFAULT '#ffffff',
  primaire_kleur text DEFAULT '#000000',
  accent_kleur text DEFAULT '#4f46e5',
  generated_html text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.newsletter_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own newsletter settings"
  ON public.newsletter_settings FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_newsletter_settings_updated_at
  BEFORE UPDATE ON public.newsletter_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
