-- Add new columns for background color and main accent gradient
ALTER TABLE public.blog_settings 
ADD COLUMN achtergrond_kleur text,
ADD COLUMN hoofdaccent_gradient text;

-- Remove the old afbeelding_prompt column
ALTER TABLE public.blog_settings 
DROP COLUMN afbeelding_prompt;