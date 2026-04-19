-- 20260418000011_fix_function_search_paths.sql
-- Resolves 'function_search_path_mutable' security warnings by explicitly
-- setting the search_path on all SECURITY DEFINER and trigger functions.

ALTER FUNCTION public.fn_sync_deal_rating() SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.increment_deal_view(UUID) SET search_path = public;
ALTER FUNCTION public.fn_sync_engagement_metrics() SET search_path = public;
ALTER FUNCTION public.handle_new_user_promotion() SET search_path = public;
ALTER FUNCTION public.fn_sync_comment_count() SET search_path = public;
