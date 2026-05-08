
-- Add company_id column to landing_schedules
ALTER TABLE public.landing_schedules
ADD COLUMN company_id uuid REFERENCES public.landing_companies(id);

-- Add unique constraint (1 schedule per company)
ALTER TABLE public.landing_schedules
ADD CONSTRAINT landing_schedules_company_id_key UNIQUE (company_id);
