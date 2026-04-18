-- ─────────────────────────────────────────────────────────────────────────────
-- DealNexus: Fix Community Relationships
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Ensure all profiles exist before applying constraints (Retroactive Sync)
INSERT INTO public.profiles (id, display_name)
SELECT id, 'NexusUser'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- 2. Update Comments table relationships
ALTER TABLE public.comments
  DROP CONSTRAINT IF EXISTS comments_user_id_fkey,
  ADD CONSTRAINT comments_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES public.profiles(id)
    ON DELETE CASCADE;

-- 3. Update Deal Ratings table relationships
ALTER TABLE public.deal_ratings
  DROP CONSTRAINT IF EXISTS deal_ratings_user_id_fkey,
  ADD CONSTRAINT deal_ratings_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES public.profiles(id)
    ON DELETE CASCADE;

-- 4. Enable efficient joining for PostgREST
-- Supabase needs to know that the foreign key exists on public schema for auto-discovery
COMMENT ON COLUMN public.comments.user_id IS '{@foreign_key public.profiles.id}';
COMMENT ON COLUMN public.deal_ratings.user_id IS '{@foreign_key public.profiles.id}';
