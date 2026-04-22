-- 1. Add featured_image_url to hero_slides
ALTER TABLE public.hero_slides ADD COLUMN IF NOT EXISTS featured_image_url TEXT;

-- 2. Create hero-banners storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('hero-banners', 'hero-banners', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Set up Storage Policies
-- Public Can Read
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
CREATE POLICY "Public Read Access" ON storage.objects
    FOR SELECT USING (bucket_id = 'hero-banners');

-- Authenticated Users (Admins) can Manage
DROP POLICY IF EXISTS "Admin Manage Access" ON storage.objects;
CREATE POLICY "Admin Manage Access" ON storage.objects
    FOR ALL TO authenticated
    USING (bucket_id = 'hero-banners')
    WITH CHECK (bucket_id = 'hero-banners');
