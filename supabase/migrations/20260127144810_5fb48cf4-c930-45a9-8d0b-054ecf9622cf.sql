-- Create workflow_executions table for accurate per-company tracking
CREATE TABLE public.workflow_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  workflow_type TEXT NOT NULL CHECK (workflow_type IN ('seo_blog', 'seo_research')),
  triggered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  triggered_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  success BOOLEAN NOT NULL DEFAULT true
);

-- Create index for efficient querying by date and company
CREATE INDEX idx_workflow_executions_triggered_at ON public.workflow_executions(triggered_at DESC);
CREATE INDEX idx_workflow_executions_company_id ON public.workflow_executions(company_id);
CREATE INDEX idx_workflow_executions_workflow_type ON public.workflow_executions(workflow_type);

-- Enable Row Level Security
ALTER TABLE public.workflow_executions ENABLE ROW LEVEL SECURITY;

-- Admins can view all workflow executions
CREATE POLICY "Admins can view all workflow executions"
ON public.workflow_executions
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Service role can insert workflow executions (for edge functions)
CREATE POLICY "Service role can insert workflow executions"
ON public.workflow_executions
FOR INSERT
WITH CHECK (true);

-- Admins can delete workflow executions
CREATE POLICY "Admins can delete workflow executions"
ON public.workflow_executions
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));