-- Add name column to email_signature_settings for multiple signatures support
ALTER TABLE public.email_signature_settings 
ADD COLUMN name TEXT NOT NULL DEFAULT 'Mijn Handtekening';