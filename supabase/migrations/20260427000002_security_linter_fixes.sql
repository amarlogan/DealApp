-- ─────────────────────────────────────────────────────────────────────────────
-- DealNexus: Security Linter Fixes (Search Paths, RLS, API Visibility)
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Fix Mutable Search Paths for Functions
-- This prevents search path hijacking by pinning functions to the public schema.

ALTER FUNCTION public.handle_identity_stitching() SET search_path = public;
ALTER FUNCTION public.refresh_mv_site_analytics() SET search_path = public;
ALTER FUNCTION public.get_price_range_analytics() SET search_path = public;
ALTER FUNCTION public.get_funnel_analytics() SET search_path = public;
ALTER FUNCTION public.get_category_analytics() SET search_path = public;

-- 2. Restrict Materialized View API Visibility
-- Materialized views shouldn't be directly accessible via the Data API for security.
-- We revoke select from anonymous and authenticated roles.
REVOKE SELECT ON public.mv_site_analytics_summary FROM anon, authenticated;

-- 3. Harden site_analytics RLS Policies
-- Replace overly permissive "true" check with explicit role checks.

DROP POLICY IF EXISTS "Anyone can log analytics events" ON public.site_analytics;
CREATE POLICY "Anyone can log analytics events"
    ON public.site_analytics
    FOR INSERT
    WITH CHECK (
        auth.role() IN ('anon', 'authenticated')
    );

-- Ensure select policy is also specific (though usually SELECT with true is okay, we keep it for admins)
-- (The admin policy already exists and is specific, so no change needed there).
