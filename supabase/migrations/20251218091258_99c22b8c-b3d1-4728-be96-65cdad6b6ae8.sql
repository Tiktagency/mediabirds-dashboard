-- Change aantal_woorden from INTEGER to TEXT to store range like "500-1000"
ALTER TABLE public.blog_settings 
ALTER COLUMN aantal_woorden TYPE TEXT USING aantal_woorden::TEXT;