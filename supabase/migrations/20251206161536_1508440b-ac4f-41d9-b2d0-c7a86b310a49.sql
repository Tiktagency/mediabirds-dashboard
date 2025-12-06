-- Add auth_token_secret_name column to companies table
ALTER TABLE public.companies 
ADD COLUMN auth_token_secret_name text;

-- Update existing companies with their auth token secret names
UPDATE public.companies 
SET auth_token_secret_name = 'N8N_WEBHOOK_AUTH_TOKEN' 
WHERE name = 'Mediabirds';

UPDATE public.companies 
SET auth_token_secret_name = 'TIKT_WEBHOOK_AUTH_TOKEN' 
WHERE name = 'Tikt';