-- Hernoem bestaande kolommen voor Hoofd zoekwoorden
ALTER TABLE blog_settings RENAME COLUMN google_sheet_id TO hoofd_google_sheet_id;
ALTER TABLE blog_settings RENAME COLUMN google_slides_id TO hoofd_google_slides_id;

-- Voeg nieuwe kolommen toe voor Nieuwe zoekwoorden
ALTER TABLE blog_settings ADD COLUMN nieuw_google_sheet_id TEXT;
ALTER TABLE blog_settings ADD COLUMN nieuw_google_slides_id TEXT;