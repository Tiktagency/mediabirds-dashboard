-- Restrict service_role policy on automation_status to service_role only
DROP POLICY IF EXISTS "Service role can manage automation statuses" ON public.automation_status;
CREATE POLICY "Service role can manage automation statuses"
ON public.automation_status
AS PERMISSIVE
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Restrict SELECT policies to authenticated role only
DROP POLICY IF EXISTS "Authenticated users can view seo settings" ON public.seo_settings;
CREATE POLICY "Authenticated users can view seo settings"
ON public.seo_settings FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can view blog schedules" ON public.blog_schedules;
CREATE POLICY "Authenticated users can view blog schedules"
ON public.blog_schedules FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can view landing schedules" ON public.landing_schedules;
CREATE POLICY "Authenticated users can view landing schedules"
ON public.landing_schedules FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can view alt text schedules" ON public.alt_text_schedules;
CREATE POLICY "Authenticated users can view alt text schedules"
ON public.alt_text_schedules FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can view seo schedules" ON public.seo_schedules;
CREATE POLICY "Authenticated users can view seo schedules"
ON public.seo_schedules FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can view newsletter schedules" ON public.newsletter_schedules;
CREATE POLICY "Authenticated users can view newsletter schedules"
ON public.newsletter_schedules FOR SELECT TO authenticated USING (true);