-- Update handle_new_user trigger to auto-assign admin role for whitelisted emails
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  
  -- Auto-assign admin role for whitelisted emails
  IF LOWER(new.email) IN (
    'lotte.seinen@mediabirds.nl',
    'joost.van.milligen@mediabirds.nl', 
    'hello@tikt.ai'
  ) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, 'admin');
  END IF;
  
  RETURN new;
END;
$$;