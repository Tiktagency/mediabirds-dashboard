-- Stap 1: seo_settings - hernoem bestaande kolommen en voeg nieuwe toe
ALTER TABLE seo_settings RENAME COLUMN google_sheet_id TO hoofd_google_sheet_id;
ALTER TABLE seo_settings RENAME COLUMN google_slides_id TO hoofd_google_slides_id;
ALTER TABLE seo_settings ADD COLUMN nieuw_google_sheet_id TEXT;
ALTER TABLE seo_settings ADD COLUMN nieuw_google_slides_id TEXT;

-- Stap 2: blog_settings - verwijder de "nieuw" kolommen en hernoem terug naar originele namen
ALTER TABLE blog_settings DROP COLUMN IF EXISTS nieuw_google_sheet_id;
ALTER TABLE blog_settings DROP COLUMN IF EXISTS nieuw_google_slides_id;
ALTER TABLE blog_settings RENAME COLUMN hoofd_google_sheet_id TO google_sheet_id;
ALTER TABLE blog_settings RENAME COLUMN hoofd_google_slides_id TO google_slides_id;