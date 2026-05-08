-- Add DELETE policy for admins on companies table
CREATE POLICY "Admins can delete companies" 
ON public.companies 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));