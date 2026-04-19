-- 20260418000009_consolidate_permissive.sql
-- Consolidate permissive RLS policies for performance.
-- This migration drops duplicate permissive policies and creates a single
-- SELECT policy (and admin‑modify policy where needed) for each table.

-- Categories
DROP POLICY IF EXISTS rls_categories_admin_modify ON public.categories;
DROP POLICY IF EXISTS rls_categories_select ON public.categories;
CREATE POLICY rls_categories_select ON public.categories
    FOR SELECT USING (true);
CREATE POLICY rls_categories_admin_modify ON public.categories
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Deal Ratings (multiple roles)
DROP POLICY IF EXISTS rls_ratings_read ON public.deal_ratings;
DROP POLICY IF EXISTS rls_ratings_upsert ON public.deal_ratings;
CREATE POLICY rls_ratings_read ON public.deal_ratings
    FOR SELECT USING (true);
CREATE POLICY rls_ratings_upsert ON public.deal_ratings
    FOR ALL USING ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);

-- Deals
DROP POLICY IF EXISTS rls_deals_select ON public.deals;
DROP POLICY IF EXISTS rls_deals_admin_modify ON public.deals;
CREATE POLICY rls_deals_select ON public.deals
    FOR SELECT USING (status = 'active' OR public.is_admin());
CREATE POLICY rls_deals_admin_modify ON public.deals
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Hero Slides
DROP POLICY IF EXISTS rls_hero_select ON public.hero_slides;
DROP POLICY IF EXISTS rls_hero_admin_modify ON public.hero_slides;
CREATE POLICY rls_hero_select ON public.hero_slides
    FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY rls_hero_admin_modify ON public.hero_slides
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Landing Sections
DROP POLICY IF EXISTS rls_landing_sections_select ON public.landing_sections;
DROP POLICY IF EXISTS rls_landing_sections_admin_modify ON public.landing_sections;
CREATE POLICY rls_landing_sections_select ON public.landing_sections
    FOR SELECT USING (is_visible = true OR public.is_admin());
CREATE POLICY rls_landing_sections_admin_modify ON public.landing_sections
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Notifications (SELECT & UPDATE)
DROP POLICY IF EXISTS rls_notifications_select ON public.notifications;
DROP POLICY IF EXISTS rls_notifications_update ON public.notifications;
DROP POLICY IF EXISTS rls_notifications_admin_all ON public.notifications;
CREATE POLICY rls_notifications_select ON public.notifications
    FOR SELECT USING ((SELECT auth.uid()) = user_id OR public.is_admin());
CREATE POLICY rls_notifications_update ON public.notifications
    FOR UPDATE USING ((SELECT auth.uid()) = user_id OR public.is_admin());
CREATE POLICY rls_notifications_admin_all ON public.notifications
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Seasons
DROP POLICY IF EXISTS rls_seasons_select ON public.seasons;
DROP POLICY IF EXISTS rls_seasons_admin_modify ON public.seasons;
CREATE POLICY rls_seasons_select ON public.seasons
    FOR SELECT USING (true);
CREATE POLICY rls_seasons_admin_modify ON public.seasons
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());
