-- ─────────────────────────────────────────────────────────────────────────────
-- Security Hardening Migration (Part 2)
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Secure function Search Paths
-- Fixes "function_search_path_mutable" warnings for defense-in-depth.

CREATE OR REPLACE FUNCTION public.update_discount_percentage()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    IF NEW.original_price > 0 THEN
        NEW.discount_percentage := ROUND(((NEW.original_price - NEW.current_price) / NEW.original_price) * 100, 2);
    ELSE
        NEW.discount_percentage := 0;
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.fn_update_discount()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    IF NEW.original_price > 0 THEN
        NEW.discount_percentage := ROUND(
            ((NEW.original_price - NEW.current_price) / NEW.original_price) * 100, 2
        );
    ELSE
        NEW.discount_percentage := 0;
    END IF;
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.fn_create_profile()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)))
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

-- 2. Harden deal_clicks insertion policy
-- Fixes "rls_policy_always_true" warning by providing a specific check and limiting roles.

DROP POLICY IF EXISTS rls_clicks_insert ON public.deal_clicks;
CREATE POLICY rls_clicks_insert ON public.deal_clicks
    FOR INSERT 
    TO anon, authenticated 
    WITH CHECK (deal_id IS NOT NULL);
