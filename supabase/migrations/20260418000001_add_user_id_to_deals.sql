-- ─────────────────────────────────────────────────────────────────────────────
-- DealNexus: Add User ID to Deals (Ownership Tracking)
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Add user_id column
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 2. Backfill existing deals with the first available admin or profile
-- This ensures existing deals have a 'Posted by' attribute.
UPDATE public.deals
SET user_id = (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
WHERE user_id IS NULL AND EXISTS (SELECT 1 FROM public.profiles WHERE role = 'admin');

-- 3. Add index for efficient joining
CREATE INDEX IF NOT EXISTS idx_deals_user_id ON public.deals(user_id);
