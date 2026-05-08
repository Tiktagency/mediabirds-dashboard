-- Add folder_id column to blog_settings table for image storage location
ALTER TABLE public.blog_settings
ADD COLUMN folder_id TEXT NULL;