-- Add n8n_workflow_name column to automation_settings
ALTER TABLE public.automation_settings 
ADD COLUMN n8n_workflow_name text;