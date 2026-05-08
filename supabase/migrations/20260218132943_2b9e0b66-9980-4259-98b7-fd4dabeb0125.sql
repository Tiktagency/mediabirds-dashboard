CREATE OR REPLACE FUNCTION public.log_user_visit(
  p_user_id uuid,
  p_email text,
  p_display_name text
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.login_logs
    WHERE user_id = p_user_id
      AND logged_in_at > now() - interval '30 seconds'
  ) THEN
    RETURN false;
  END IF;

  INSERT INTO public.login_logs (user_id, email, display_name)
  VALUES (p_user_id, p_email, p_display_name);

  RETURN true;
END;
$$;