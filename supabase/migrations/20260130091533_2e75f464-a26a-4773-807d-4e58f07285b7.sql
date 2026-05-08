-- Voeg nieuwe array kolommen toe voor meerdere emails, telefoonnummers en plaatsnamen
ALTER TABLE email_signature_settings 
ADD COLUMN emails JSONB DEFAULT '[]'::jsonb,
ADD COLUMN phone_numbers JSONB DEFAULT '[]'::jsonb,
ADD COLUMN locations JSONB DEFAULT '[]'::jsonb;

-- Migreer bestaande data naar arrays
UPDATE email_signature_settings 
SET 
  emails = CASE WHEN email IS NOT NULL THEN jsonb_build_array(email) ELSE '[]'::jsonb END,
  phone_numbers = CASE WHEN phone_number IS NOT NULL THEN jsonb_build_array(phone_number) ELSE '[]'::jsonb END,
  locations = CASE WHEN location IS NOT NULL THEN jsonb_build_array(location) ELSE '[]'::jsonb END;