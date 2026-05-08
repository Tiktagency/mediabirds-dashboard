-- Add company_logo_url column to email_signature_settings
ALTER TABLE email_signature_settings 
ADD COLUMN company_logo_url TEXT;