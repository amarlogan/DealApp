-- 20260418000008_fix_auth_uid_policies.sql
-- Fix direct auth.uid() calls in RLS policies for deal_ratings and comments.
-- This migration drops the existing policies and recreates them using
-- (SELECT auth.uid()) to ensure the auth function is evaluated once per statement.

-- Deal Ratings policies
DROP POLICY IF EXISTS rls_ratings_read ON public.deal_ratings;
DROP POLICY IF EXISTS rls_ratings_upsert ON public.deal_ratings;

CREATE POLICY rls_ratings_read ON public.deal_ratings
    FOR SELECT USING (true);

CREATE POLICY rls_ratings_upsert ON public.deal_ratings
    FOR ALL USING ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);

-- Comments policies
DROP POLICY IF EXISTS rls_comments_read ON public.comments;
DROP POLICY IF EXISTS rls_comments_post ON public.comments;
DROP POLICY IF EXISTS rls_comments_manage ON public.comments;
DROP POLICY IF EXISTS rls_comments_delete ON public.comments;

CREATE POLICY rls_comments_read ON public.comments
    FOR SELECT USING (true);

CREATE POLICY rls_comments_post ON public.comments
    FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY rls_comments_manage ON public.comments
    FOR UPDATE USING ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY rls_comments_delete ON public.comments
    FOR DELETE USING ((SELECT auth.uid()) = user_id);
