
-- 1. Remove login_logs from realtime publication (sensitive emails should not broadcast)
ALTER PUBLICATION supabase_realtime DROP TABLE public.login_logs;

-- 2. Restrict log_settings SELECT to admins only (contains slack webhook + alert email)
DROP POLICY IF EXISTS "Authenticated users can view log settings" ON public.log_settings;
CREATE POLICY "Admins can view log settings"
ON public.log_settings FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- 3. Restrict automation_settings SELECT to admins (contains webhook URLs)
DROP POLICY IF EXISTS "Authenticated users can view automation settings" ON public.automation_settings;
CREATE POLICY "Admins can view automation settings"
ON public.automation_settings FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- 4. Restrict blog_settings SELECT to admins (Google IDs, webhook URLs)
DROP POLICY IF EXISTS "Authenticated users can view blog settings" ON public.blog_settings;
CREATE POLICY "Admins can view blog settings"
ON public.blog_settings FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- 5. Restrict seo_settings SELECT to admins (Google IDs)
DROP POLICY IF EXISTS "Authenticated users can view seo settings" ON public.seo_settings;
CREATE POLICY "Admins can view seo settings"
ON public.seo_settings FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- 6. Fix notifications INSERT: only service_role may insert
DROP POLICY IF EXISTS "Service role can insert notifications" ON public.notifications;
CREATE POLICY "Service role can insert notifications"
ON public.notifications FOR INSERT
TO service_role
WITH CHECK (true);
-- Allow authenticated users to insert notifications targeting themselves only
CREATE POLICY "Users can insert notifications for themselves"
ON public.notifications FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 7. Fix workflow_executions INSERT: only service_role may insert
DROP POLICY IF EXISTS "Service role can insert workflow executions" ON public.workflow_executions;
CREATE POLICY "Service role can insert workflow executions"
ON public.workflow_executions FOR INSERT
TO service_role
WITH CHECK (true);

-- 8. Fix profile-photos storage: restrict INSERT path to user's own folder
DROP POLICY IF EXISTS "Authenticated users can upload profile photos" ON storage.objects;
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT polname FROM pg_policy
    WHERE polrelid = 'storage.objects'::regclass
      AND polcmd = 'a'
  LOOP
    -- look for any insert policy targeting profile-photos
    NULL;
  END LOOP;
END $$;

-- Drop common variants if present, then create strict policy
DROP POLICY IF EXISTS "Users can upload to profile-photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload profile photos" ON storage.objects;
DROP POLICY IF EXISTS "profile-photos insert" ON storage.objects;

CREATE POLICY "Users can upload own profile photo"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-photos'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- 9. Restrict EXECUTE on SECURITY DEFINER helper functions to authenticated only (RLS policies still work)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.log_user_visit(uuid, text, text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.log_user_visit(uuid, text, text) TO authenticated;
