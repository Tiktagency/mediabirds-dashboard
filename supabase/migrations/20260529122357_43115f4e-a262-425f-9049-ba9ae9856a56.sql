
REVOKE ALL ON FUNCTION public.is_demo_user(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_demo_user(uuid) TO service_role;
