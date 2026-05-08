-- Add used_folder_id column for used photos folder
ALTER TABLE blog_settings 
ADD COLUMN used_folder_id TEXT;