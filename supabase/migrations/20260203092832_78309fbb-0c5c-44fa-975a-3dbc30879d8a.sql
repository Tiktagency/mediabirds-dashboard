-- Drop de oude policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Maak een nieuwe policy die beide rollen toestaat
CREATE POLICY "Admins can view all profiles" ON profiles
FOR SELECT
TO public
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'super_admin'::app_role)
);