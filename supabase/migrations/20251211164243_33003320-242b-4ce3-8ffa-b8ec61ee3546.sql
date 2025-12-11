-- Add time_saved_per_execution column to automation_settings
ALTER TABLE public.automation_settings 
ADD COLUMN time_saved_per_execution integer DEFAULT 5;