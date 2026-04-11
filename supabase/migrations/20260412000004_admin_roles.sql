-- ─────────────────────────────────────────────────────────────────────────────
-- Admin Roles & RBAC Migration
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Update profiles table to include roles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- 2. Create helper function for admin checks (efficient in policies)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'admin'
    FROM public.profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Update RLS Policies for Admin Access

-- Deals: Admins can do everything; public reads active.
DROP POLICY IF EXISTS rls_deals_admin ON public.deals;
CREATE POLICY rls_deals_admin ON public.deals
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Categories: Admins can do everything; public reads active.
DROP POLICY IF EXISTS rls_categories_admin ON public.categories;
CREATE POLICY rls_categories_admin ON public.categories
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Seasons: Admins can do everything; public reads active.
DROP POLICY IF EXISTS rls_seasons_admin ON public.seasons;
CREATE POLICY rls_seasons_admin ON public.seasons
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Landing Sections: Admins can do everything; public reads active.
DROP POLICY IF EXISTS rls_landing_sections_admin ON public.landing_sections;
CREATE POLICY rls_landing_sections_admin ON public.landing_sections
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Profiles: Admins can see all profiles; users see only their own.
DROP POLICY IF EXISTS rls_profiles_admin ON public.profiles;
CREATE POLICY rls_profiles_admin ON public.profiles
    FOR SELECT TO authenticated
    USING (public.is_admin());
