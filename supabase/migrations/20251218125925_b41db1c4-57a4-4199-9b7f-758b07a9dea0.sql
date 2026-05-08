-- Allow admins to insert new companies
CREATE POLICY "Admins can insert companies" 
ON public.companies 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));