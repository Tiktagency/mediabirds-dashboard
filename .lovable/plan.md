
# Plan: Volledige Super Admin RLS Synchronisatie

## Probleem
Na het toevoegen van de `super_admin` rol zijn alleen de `profiles` en `companies` tabellen bijgewerkt. Super admins hebben daardoor geen toegang tot de meeste admin-functionaliteit in het dashboard.

## Overzicht Benodigde Wijzigingen

### Tabellen die moeten worden bijgewerkt (14 totaal):

| Tabel | Te updaten policies |
|-------|---------------------|
| automation_status | SELECT, ALL (service role) |
| workflow_executions | SELECT, DELETE |
| automation_logs | ALL |
| blog_settings | INSERT, UPDATE, DELETE |
| blog_categories | ALL |
| user_dashboard_settings | SELECT (admin view all) |
| seo_schedules | ALL |
| user_automation_permissions | ALL |
| seo_settings | INSERT, UPDATE, DELETE |
| user_roles | SELECT, INSERT, UPDATE, DELETE |
| automation_settings | ALL |
| log_settings | ALL |
| page_url_settings | INSERT, UPDATE |
| blog_schedules | ALL |

---

## Database Wijzigingen (SQL)

De migratie zal alle admin-only policies droppen en opnieuw aanmaken met de toegevoegde `super_admin` check:

```sql
-- Pattern voor elke policy:
DROP POLICY IF EXISTS "Policy naam" ON tabelnaam;
CREATE POLICY "Policy naam" ON tabelnaam
FOR [SELECT/INSERT/UPDATE/DELETE/ALL] TO public
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'super_admin'::app_role)
)
WITH CHECK (...); -- waar nodig
```

### Volledige SQL per tabel:

**1. automation_status**
```sql
DROP POLICY IF EXISTS "Admins can view all automation statuses" ON automation_status;
CREATE POLICY "Admins can view all automation statuses" ON automation_status
FOR SELECT TO public
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
);
```

**2. workflow_executions**
```sql
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
```

**3. automation_logs**
```sql
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
```

**4. blog_settings**
```sql
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
```

**5. blog_categories**
```sql
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
```

**6. user_dashboard_settings**
```sql
DROP POLICY IF EXISTS "Admins can view all dashboard settings" ON user_dashboard_settings;
CREATE POLICY "Admins can view all dashboard settings" ON user_dashboard_settings
FOR SELECT TO public
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
);
```

**7. seo_schedules**
```sql
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
```

**8. user_automation_permissions**
```sql
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
```

**9. seo_settings**
```sql
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
```

**10. user_roles**
```sql
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
```

**11. automation_settings**
```sql
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
```

**12. log_settings**
```sql
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
```

**13. page_url_settings**
```sql
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
```

**14. blog_schedules**
```sql
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
```

---

## Resultaat na implementatie

| Functionaliteit | super_admin | admin |
|-----------------|-------------|-------|
| Dashboard tiles bekijken | Ja | Ja |
| Automation status bekijken | Ja | Ja |
| Workflow executions beheren | Ja | Ja |
| Automation logs beheren | Ja | Ja |
| Blog settings beheren | Ja | Ja |
| SEO settings beheren | Ja | Ja |
| User roles beheren | Ja | Ja |
| Log settings beheren | Ja | Ja |
| Schedules beheren | Ja | Ja |
| Alle overige admin functies | Ja | Ja |

Na deze migratie heeft `super_admin` exact dezelfde database-toegang als `admin` in het hele dashboard.
