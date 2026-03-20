-- Add blogs_webhook column to companies table
ALTER TABLE public.companies 
ADD COLUMN blogs_webhook text;