-- ===========================================
-- VOLLEDIGE SUPER ADMIN RLS SYNCHRONISATIE
-- 14 tabellen worden bijgewerkt
-- ===========================================

-- 1. automation_status
DROP POLICY IF EXISTS "Admins can view all automation statuses" ON automation_status;
CREATE POLICY "Admins can view all automation statuses" ON automation_status
FOR SELECT TO public
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

-- 2. workflow_executions
DROP POLICY IF EXISTS "Admins can view all workflow executions" ON workflow_executions;
DROP POLICY IF EXISTS "Admins can delete workflow executions" ON workflow_executions;

CREATE POLICY "Admins can view all workflow executions" ON workflow_executions
FOR SELECT TO public
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Admins can delete workflow executions" ON workflow_executions
FOR DELETE TO public
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

-- 3. automation_logs
DROP POLICY IF EXISTS "Admins can manage automation logs" ON automation_logs;
CREATE POLICY "Admins can manage automation logs" ON automation_logs
FOR ALL TO public
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

-- 4. blog_settings
DROP POLICY IF EXISTS "Admins can insert blog settings" ON blog_settings;
DROP POLICY IF EXISTS "Admins can update blog settings" ON blog_settings;
DROP POLICY IF EXISTS "Admins can delete blog settings" ON blog_settings;

CREATE POLICY "Admins can insert blog settings" ON blog_settings
FOR INSERT TO public
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Admins can update blog settings" ON blog_settings
FOR UPDATE TO public
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Admins can delete blog settings" ON blog_settings
FOR DELETE TO public
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

-- 5. blog_categories
DROP POLICY IF EXISTS "Admins can manage blog categories" ON blog_categories;
CREATE POLICY "Admins can manage blog categories" ON blog_categories
FOR ALL TO public
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

-- 6. user_dashboard_settings
DROP POLICY IF EXISTS "Admins can view all dashboard settings" ON user_dashboard_settings;
CREATE POLICY "Admins can view all dashboard settings" ON user_dashboard_settings
FOR SELECT TO public
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

-- 7. seo_schedules
DROP POLICY IF EXISTS "Admins can manage seo schedules" ON seo_schedules;
CREATE POLICY "Admins can manage seo schedules" ON seo_schedules
FOR ALL TO public
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

-- 8. user_automation_permissions
DROP POLICY IF EXISTS "Admins can manage all permissions" ON user_automation_permissions;
CREATE POLICY "Admins can manage all permissions" ON user_automation_permissions
FOR ALL TO public
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

-- 9. seo_settings
DROP POLICY IF EXISTS "Admins can insert seo settings" ON seo_settings;
DROP POLICY IF EXISTS "Admins can update seo settings" ON seo_settings;
DROP POLICY IF EXISTS "Admins can delete seo settings" ON seo_settings;

CREATE POLICY "Admins can insert seo settings" ON seo_settings
FOR INSERT TO public
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Admins can update seo settings" ON seo_settings
FOR UPDATE TO public
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Admins can delete seo settings" ON seo_settings
FOR DELETE TO public
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

-- 10. user_roles
DROP POLICY IF EXISTS "Admins can view all user roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can insert user roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can update user roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can delete user roles" ON user_roles;

CREATE POLICY "Admins can view all user roles" ON user_roles
FOR SELECT TO public
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Admins can insert user roles" ON user_roles
FOR INSERT TO public
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Admins can update user roles" ON user_roles
FOR UPDATE TO public
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Admins can delete user roles" ON user_roles
FOR DELETE TO public
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

-- 11. automation_settings
DROP POLICY IF EXISTS "Admins can manage automation settings" ON automation_settings;
CREATE POLICY "Admins can manage automation settings" ON automation_settings
FOR ALL TO public
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

-- 12. log_settings
DROP POLICY IF EXISTS "Admins can manage log settings" ON log_settings;
CREATE POLICY "Admins can manage log settings" ON log_settings
FOR ALL TO public
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

-- 13. page_url_settings
DROP POLICY IF EXISTS "Admins can insert page_url_settings" ON page_url_settings;
DROP POLICY IF EXISTS "Admins can update page_url_settings" ON page_url_settings;

CREATE POLICY "Admins can insert page_url_settings" ON page_url_settings
FOR INSERT TO public
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Admins can update page_url_settings" ON page_url_settings
FOR UPDATE TO public
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

-- 14. blog_schedules
DROP POLICY IF EXISTS "Admins can manage blog schedules" ON blog_schedules;
CREATE POLICY "Admins can manage blog schedules" ON blog_schedules
FOR ALL TO public
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
);