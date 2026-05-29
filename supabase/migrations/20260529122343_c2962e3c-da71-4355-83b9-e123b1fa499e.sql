
-- Add demo flag to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;

-- Security-definer helper so policies/triggers/edge fns can check demo status without RLS recursion
CREATE OR REPLACE FUNCTION public.is_demo_user(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((SELECT is_demo FROM public.profiles WHERE id = _user_id), false)
$$;

-- Mark Luc as demo and ensure admin role
UPDATE public.profiles
SET is_demo = true
WHERE LOWER(email) = 'luc.degraag@student.hu.nl';

INSERT INTO public.user_roles (user_id, role)
SELECT p.id, 'admin'::app_role
FROM public.profiles p
WHERE LOWER(p.email) = 'luc.degraag@student.hu.nl'
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = p.id AND ur.role = 'admin'::app_role
  );
