-- Allow admins to update companies
CREATE POLICY "Admins can update companies" 
ON public.companies 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));