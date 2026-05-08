
-- Add first_name and last_name columns to profiles table
ALTER TABLE public.profiles ADD COLUMN first_name text DEFAULT null;
ALTER TABLE public.profiles ADD COLUMN last_name text DEFAULT null;

-- Add RLS policy for users to update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);
