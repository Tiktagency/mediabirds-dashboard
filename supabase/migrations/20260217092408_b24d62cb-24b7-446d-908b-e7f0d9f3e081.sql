
-- Create role_default_permissions table
CREATE TABLE public.role_default_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role public.app_role NOT NULL,
  automation_name TEXT NOT NULL,
  can_view BOOLEAN NOT NULL DEFAULT true,
  can_execute BOOLEAN NOT NULL DEFAULT false,
  can_manage BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (role, automation_name)
);

-- Enable RLS
ALTER TABLE public.role_default_permissions ENABLE ROW LEVEL SECURITY;

-- Admins and super_admins can do everything
CREATE POLICY "Admins can manage role default permissions"
ON public.role_default_permissions
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- All authenticated users can read
CREATE POLICY "Authenticated users can view role default permissions"
ON public.role_default_permissions
FOR SELECT
USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_role_default_permissions_updated_at
BEFORE UPDATE ON public.role_default_permissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
