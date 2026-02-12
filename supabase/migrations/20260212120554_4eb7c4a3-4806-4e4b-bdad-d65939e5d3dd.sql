ALTER TABLE seo_settings ADD CONSTRAINT seo_settings_company_id_unique UNIQUE (company_id);
ALTER TABLE blog_settings ADD CONSTRAINT blog_settings_company_id_unique UNIQUE (company_id);