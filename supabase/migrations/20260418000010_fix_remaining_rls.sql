-- 20260418000010_fix_remaining_rls.sql
-- Resolves remaining `auth_rls_initplan` and `multiple_permissive_policies` warnings
-- by replacing `FOR ALL` policies with discrete `INSERT`/`UPDATE`/`DELETE` policies
-- and properly isolating direct `auth.<function>()` calls.

-- 1. Comment Reports (Fix auth_rls_initplan & overlapping SELECT)
DROP POLICY IF EXISTS rls_reports_insert ON public.comment_reports;
DROP POLICY IF EXISTS rls_reports_select_own ON public.comment_reports;
DROP POLICY IF EXISTS rls_reports_admin ON public.comment_reports;

CREATE POLICY rls_reports_insert ON public.comment_reports
    FOR INSERT TO authenticated
    WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY rls_reports_select ON public.comment_reports
    FOR SELECT TO authenticated
    USING ((SELECT auth.uid()) = user_id OR public.is_admin());

-- 2. Categories (Split ALL to avoid SELECT overlap)
DROP POLICY IF EXISTS rls_categories_admin_modify ON public.categories;
CREATE POLICY rls_categories_admin_insert ON public.categories FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY rls_categories_admin_update ON public.categories FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY rls_categories_admin_delete ON public.categories FOR DELETE TO authenticated USING (public.is_admin());

-- 3. Deal Ratings (Split ALL to avoid SELECT overlap)
DROP POLICY IF EXISTS rls_ratings_upsert ON public.deal_ratings;
CREATE POLICY rls_ratings_insert ON public.deal_ratings FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY rls_ratings_update ON public.deal_ratings FOR UPDATE USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY rls_ratings_delete ON public.deal_ratings FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- 4. Deals (Split ALL to avoid SELECT overlap)
DROP POLICY IF EXISTS rls_deals_admin_modify ON public.deals;
CREATE POLICY rls_deals_admin_insert ON public.deals FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY rls_deals_admin_update ON public.deals FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY rls_deals_admin_delete ON public.deals FOR DELETE TO authenticated USING (public.is_admin());

-- 5. Hero Slides (Split ALL to avoid SELECT overlap)
DROP POLICY IF EXISTS rls_hero_admin_modify ON public.hero_slides;
CREATE POLICY rls_hero_admin_insert ON public.hero_slides FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY rls_hero_admin_update ON public.hero_slides FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY rls_hero_admin_delete ON public.hero_slides FOR DELETE TO authenticated USING (public.is_admin());

-- 6. Landing Sections (Split ALL to avoid SELECT overlap)
DROP POLICY IF EXISTS rls_landing_sections_admin_modify ON public.landing_sections;
CREATE POLICY rls_landing_sections_admin_insert ON public.landing_sections FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY rls_landing_sections_admin_update ON public.landing_sections FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY rls_landing_sections_admin_delete ON public.landing_sections FOR DELETE TO authenticated USING (public.is_admin());

-- 7. Notifications (Split ALL to avoid SELECT/UPDATE overlap)
DROP POLICY IF EXISTS rls_notifications_admin_all ON public.notifications;
CREATE POLICY rls_notifications_admin_insert ON public.notifications FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY rls_notifications_admin_delete ON public.notifications FOR DELETE TO authenticated USING (public.is_admin());
-- (Note: UPDATE is already handled exclusively by `rls_notifications_update` via the previous migration)

-- 8. Seasons (Split ALL to avoid SELECT overlap)
DROP POLICY IF EXISTS rls_seasons_admin_modify ON public.seasons;
CREATE POLICY rls_seasons_admin_insert ON public.seasons FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY rls_seasons_admin_update ON public.seasons FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY rls_seasons_admin_delete ON public.seasons FOR DELETE TO authenticated USING (public.is_admin());
