-- Add foreign key constraint from blog_schedules to companies
ALTER TABLE public.blog_schedules
ADD CONSTRAINT blog_schedules_company_id_fkey
FOREIGN KEY (company_id)
REFERENCES public.companies(id)
ON DELETE CASCADE;