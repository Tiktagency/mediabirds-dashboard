
ALTER TABLE public.newsletter_settings
  ADD COLUMN IF NOT EXISTS tagline text,
  ADD COLUMN IF NOT EXISTS bedrijfsomschrijving text,
  ADD COLUMN IF NOT EXISTS doelgroep text,
  ADD COLUMN IF NOT EXISTS toon text,
  ADD COLUMN IF NOT EXISTS cta_tekst text,
  ADD COLUMN IF NOT EXISTS cta_url text,
  ADD COLUMN IF NOT EXISTS website text,
  ADD COLUMN IF NOT EXISTS secundaire_kleur text DEFAULT '#1A2B5E',
  ADD COLUMN IF NOT EXISTS kaart_achtergrond text DEFAULT '#FFFFFF',
  ADD COLUMN IF NOT EXISTS tekst_kleur text DEFAULT '#1A1A2E',
  ADD COLUMN IF NOT EXISTS subtekst_kleur text DEFAULT '#6B7280',
  ADD COLUMN IF NOT EXISTS cta_tekst_kleur text DEFAULT '#FFFFFF',
  ADD COLUMN IF NOT EXISTS footer_achtergrond text DEFAULT '#1A2B5E',
  ADD COLUMN IF NOT EXISTS footer_tekst_kleur text DEFAULT '#E8EDF7';
