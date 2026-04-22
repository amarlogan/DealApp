-- Add is_image_only flag to hero_slides
ALTER TABLE public.hero_slides ADD COLUMN IF NOT EXISTS is_image_only BOOLEAN DEFAULT false;
