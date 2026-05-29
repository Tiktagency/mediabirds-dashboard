CREATE OR REPLACE FUNCTION public.is_demo_user(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    COALESCE((SELECT is_demo FROM public.profiles WHERE id = _user_id), false)
    OR EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = _user_id
        AND LOWER(email) = 'luc.degraag@student.hu.nl'
    )
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, is_demo)
  VALUES (
    new.id,
    new.email,
    LOWER(new.email) = 'luc.degraag@student.hu.nl'
  );

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

UPDATE public.profiles p
SET is_demo = true
FROM auth.users u
WHERE p.id = u.id AND LOWER(u.email) = 'luc.degraag@student.hu.nl';