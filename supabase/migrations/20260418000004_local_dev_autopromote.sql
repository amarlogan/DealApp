-- ─────────────────────────────────────────────────────────────────────────────
-- Local Development: Auto-Promote All Users to Admin
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Ensure any current users are admins
UPDATE public.profiles SET role = 'admin';

-- 2. Create trigger to automatically promote new users to admin
-- This is strictly for local dev convenience.
CREATE OR REPLACE FUNCTION public.handle_new_user_promotion()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET role = 'admin'
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Drop if exists and recreate trigger
DROP TRIGGER IF EXISTS on_profile_created_promote ON public.profiles;
CREATE TRIGGER on_profile_created_promote
AFTER INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_promotion();
