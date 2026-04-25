-- ─────────────────────────────────────────────────────────────────────────────
-- SECURITY FIX: Disable Admin Auto-Promotion
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Remove the dangerous auto-promote trigger on profiles
DROP TRIGGER IF EXISTS on_profile_created_promote ON public.profiles;

-- 2. Remove the function that handled the auto-promotion
DROP FUNCTION IF EXISTS public.handle_new_user_promotion();

-- Note: This migration does NOT reset existing user roles as requested.
-- New users will now correctly default to 'user' role.
