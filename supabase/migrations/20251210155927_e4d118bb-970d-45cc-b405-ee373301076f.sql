-- Add n8n workflow name columns to companies table
ALTER TABLE public.companies 
ADD COLUMN seo_research_n8n_name text,
ADD COLUMN subkeywords_n8n_name text,
ADD COLUMN blogs_n8n_name text;