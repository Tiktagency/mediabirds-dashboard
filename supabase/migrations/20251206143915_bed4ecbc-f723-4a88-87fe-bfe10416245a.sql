-- Create companies table for storing company-specific webhook configurations
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  seo_research_webhook TEXT NOT NULL,
  subkeywords_webhook TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Only admins can view companies
CREATE POLICY "Admins can view companies"
ON public.companies
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Insert Mediabirds as the first company with existing webhooks
INSERT INTO public.companies (name, seo_research_webhook, subkeywords_webhook)
VALUES (
  'Mediabirds',
  'https://tikt.app.n8n.cloud/webhook/b932bfda-0727-4ff4-b311-b234be0ff953',
  'https://tikt.app.n8n.cloud/webhook/c7c16588-ebba-4569-a85b-543fc5bdb4c1'
);