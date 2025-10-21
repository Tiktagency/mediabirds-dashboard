-- Update handle_new_user function to include isabelle.rutten@mediabirds.nl
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  
  -- Auto-assign admin role for whitelisted emails
  IF LOWER(new.email) IN (
    'lotte.seinen@mediabirds.nl',
    'joost.van.milligen@mediabirds.nl',
    'isabelle.rutten@mediabirds.nl',
    'hello@tikt.ai'
  ) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, 'admin');
  END IF;
  
  RETURN new;
END;
$$;