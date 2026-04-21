-- ─────────────────────────────────────────────────────────────────────────────
-- Hero Banner Carousel Schema
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Create the hero_slides table
CREATE TABLE IF NOT EXISTS public.hero_slides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    subtitle TEXT,
    accent_text TEXT,
    tag_text TEXT,
    image_url TEXT NOT NULL,
    button_text TEXT DEFAULT 'Browse Deals',
    button_link TEXT DEFAULT '/deals',
    bg_gradient TEXT DEFAULT 'from-[#1a3a0f] via-[#2a5c18] to-[#4a8a2a]',
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
-- Public Can Read Active Slides
DROP POLICY IF EXISTS rls_hero_public_read ON public.hero_slides;
CREATE POLICY rls_hero_public_read ON public.hero_slides
    FOR SELECT USING (is_active = true);

-- Admins Can Manage Everything
DROP POLICY IF EXISTS rls_hero_admin_all ON public.hero_slides;
CREATE POLICY rls_hero_admin_all ON public.hero_slides
    FOR ALL TO authenticated
    USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

-- 4. Initial Seed Data
INSERT INTO public.hero_slides (title, subtitle, accent_text, tag_text, image_url, sort_order)
VALUES 
(
    'Shop Smarter.', 
    'The best deals across electronics, fashion, home, shoes, and more - from 200+ top brands.', 
    'Save More.', 
    'Top Deals - Updated Daily', 
    'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600&q=60',
    10
),
(
    'Spring Collection', 
    'Unlock exclusive discounts on seasonal fashion and outdoor gear.', 
    'Up to 40% Off', 
    'Limited Time Event', 
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=60',
    20
);
