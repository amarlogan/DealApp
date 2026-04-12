-- ─────────────────────────────────────────────────────────────────────────────
-- Fix RLS Recursion in Profiles Table
-- ─────────────────────────────────────────────────────────────────────────────

-- The previous logic had a single policy 'rls_profiles_admin' that called 'is_admin()'.
-- Since 'is_admin()' selects from 'profiles', it triggered the policy again, causing infinite recursion.

-- 1. Remove the recursive policy
DROP POLICY IF EXISTS rls_profiles_admin ON public.profiles;

-- 2. Allow users to see their own profile (this breaks the recursion loop)
-- When an admin check happens, the system needs to read the current user's role.
-- This policy allows that read to happen without checking 'is_admin()'.
CREATE POLICY rls_profiles_self ON public.profiles
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

-- 3. Allow Admins to see all profiles
-- Now that 'self' is handled, this subquery will succeed for the current user's role check.
CREATE POLICY rls_profiles_admin_all ON public.profiles
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 4. Enable updates for Admins via RLS (optional, since API uses service_role, but good for security)
CREATE POLICY rls_profiles_admin_update ON public.profiles
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
