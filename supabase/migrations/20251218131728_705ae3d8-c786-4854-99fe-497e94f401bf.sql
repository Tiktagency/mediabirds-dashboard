-- Make webhook fields nullable so companies can be created with just a name
ALTER TABLE public.companies 
  ALTER COLUMN seo_research_webhook DROP NOT NULL,
  ALTER COLUMN subkeywords_webhook DROP NOT NULL;