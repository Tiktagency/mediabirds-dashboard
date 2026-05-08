-- Add flexible interval columns to seo_schedules
ALTER TABLE public.seo_schedules
  ADD COLUMN IF NOT EXISTS interval_value INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS interval_unit TEXT NOT NULL DEFAULT 'weeks' 
    CHECK (interval_unit IN ('days', 'weeks', 'months'));

-- Add flexible interval columns to blog_schedules
ALTER TABLE public.blog_schedules
  ADD COLUMN IF NOT EXISTS interval_value INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS interval_unit TEXT NOT NULL DEFAULT 'weeks'
    CHECK (interval_unit IN ('days', 'weeks', 'months'));

-- Migrate existing frequency values to new columns
-- daily -> 1 day
UPDATE public.seo_schedules SET interval_value = 1, interval_unit = 'days' WHERE frequency = 'daily';
UPDATE public.blog_schedules SET interval_value = 1, interval_unit = 'days' WHERE frequency = 'daily';

-- weekly -> 1 week
UPDATE public.seo_schedules SET interval_value = 1, interval_unit = 'weeks' WHERE frequency = 'weekly';
UPDATE public.blog_schedules SET interval_value = 1, interval_unit = 'weeks' WHERE frequency = 'weekly';

-- biweekly -> 2 weeks
UPDATE public.seo_schedules SET interval_value = 2, interval_unit = 'weeks' WHERE frequency = 'biweekly';
UPDATE public.blog_schedules SET interval_value = 2, interval_unit = 'weeks' WHERE frequency = 'biweekly';

-- monthly -> 1 month
UPDATE public.seo_schedules SET interval_value = 1, interval_unit = 'months' WHERE frequency = 'monthly';
UPDATE public.blog_schedules SET interval_value = 1, interval_unit = 'months' WHERE frequency = 'monthly';