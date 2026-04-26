-- Migration: Identity Stitching, Materialized Views, and Security Updates

-- 1. Identity Stitching Function
-- This trigger fires when a user's is_anonymous flag changes from true to false.
-- Note: In Supabase, linking an identity usually keeps the same auth.users.id.
-- However, if your implementation merges accounts and provides a different UUID, this covers it.
CREATE OR REPLACE FUNCTION public.handle_identity_stitching()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.is_anonymous = true AND NEW.is_anonymous = false THEN
        -- Transfer site_analytics
        UPDATE public.site_analytics
        SET user_id = NEW.id
        WHERE user_id = OLD.id;

        -- Transfer favorites (handling potential unique constraint conflicts)
        UPDATE public.favorites
        SET user_id = NEW.id
        WHERE user_id = OLD.id
        AND NOT EXISTS (
            SELECT 1 FROM public.favorites f2 
            WHERE f2.user_id = NEW.id AND f2.deal_id = public.favorites.deal_id
        );
        -- Clean up any remaining duplicates
        DELETE FROM public.favorites WHERE user_id = OLD.id;
        
        -- Transfer price_alerts
        UPDATE public.price_alerts
        SET user_id = NEW.id
        WHERE user_id = OLD.id
        AND NOT EXISTS (
            SELECT 1 FROM public.price_alerts pa2 
            WHERE pa2.user_id = NEW.id AND pa2.deal_id = public.price_alerts.deal_id
        );
        DELETE FROM public.price_alerts WHERE user_id = OLD.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_identity_stitching ON auth.users;
CREATE TRIGGER on_auth_user_identity_stitching
AFTER UPDATE ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_identity_stitching();


-- 2. Materialized View for Analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_site_analytics_summary AS
SELECT 
    DATE_TRUNC('day', created_at) as day,
    event_type,
    category_id,
    deal_id,
    COUNT(*) as event_count,
    COUNT(DISTINCT user_id) as unique_users
FROM public.site_analytics
GROUP BY DATE_TRUNC('day', created_at), event_type, category_id, deal_id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_site_analytics_summary_unique
ON public.mv_site_analytics_summary(day, event_type, category_id, deal_id);

CREATE OR REPLACE FUNCTION public.refresh_mv_site_analytics()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_site_analytics_summary;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. Ensure RLS Policies are Secure on site_analytics
ALTER TABLE public.site_analytics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can log analytics events" ON public.site_analytics;
CREATE POLICY "Anyone can log analytics events"
    ON public.site_analytics
    FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view analytics" ON public.site_analytics;
CREATE POLICY "Admins can view analytics"
    ON public.site_analytics
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );
