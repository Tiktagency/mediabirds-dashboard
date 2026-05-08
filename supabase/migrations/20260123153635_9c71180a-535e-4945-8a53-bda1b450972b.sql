-- Add image_type column to blog_settings table for storing the image source choice
ALTER TABLE public.blog_settings
ADD COLUMN image_type TEXT NULL DEFAULT 'ai_image';