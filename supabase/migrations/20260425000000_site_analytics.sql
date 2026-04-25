-- Create the site_analytics table for tracking user behavior
CREATE TABLE IF NOT EXISTS public.site_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    
    -- session info
    user_id UUID, -- Auth ID (can be anonymous or logged in)
    session_id TEXT, -- Optional client-side session ID
    
    -- event info
    event_type TEXT NOT NULL, -- 'page_view', 'deal_click', 'get_deal_click', 'search', etc.
    path TEXT, -- URL path
    
    -- entity links
    deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
    category_id TEXT,
    
    -- rich data
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    user_agent TEXT
);

-- Enable RLS
ALTER TABLE public.site_analytics ENABLE ROW LEVEL SECURITY;

-- Policies
-- 1. Anyone can insert (asynchronous tracking from frontend)
CREATE POLICY "Anyone can log analytics events"
    ON public.site_analytics
    FOR INSERT
    WITH CHECK (true);

-- 2. Only admins can view the data
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

-- Indexes for performance
-- BRIN index is excellent for time-ordered data like logs
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON public.site_analytics USING BRIN (created_at);

-- Standard B-Tree indexes for filtering in the dashboard
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON public.site_analytics (event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_deal_id ON public.site_analytics (deal_id);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON public.site_analytics (user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_category_id ON public.site_analytics (category_id);

-- RPC for summary stats
CREATE OR REPLACE FUNCTION get_analytics_summary()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_views', (SELECT count(*) FROM site_analytics WHERE event_type = 'page_view'),
        'total_clicks', (SELECT count(*) FROM site_analytics WHERE event_type = 'get_deal_click'),
        'unique_users', (SELECT count(DISTINCT user_id) FROM site_analytics),
        'anonymous_users', (SELECT count(DISTINCT user_id) FROM site_analytics WHERE user_id IS NOT NULL AND user_id NOT IN (SELECT id FROM auth.users WHERE email IS NOT NULL)),
        'today_views', (SELECT count(*) FROM site_analytics WHERE event_type = 'page_view' AND created_at > now() - interval '24 hours'),
        'today_clicks', (SELECT count(*) FROM site_analytics WHERE event_type = 'get_deal_click' AND created_at > now() - interval '24 hours')
    ) INTO result;
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC for category performance
CREATE OR REPLACE FUNCTION get_category_analytics()
RETURNS TABLE(category_id TEXT, views BIGINT, clicks BIGINT, ctr NUMERIC) AS $$
BEGIN
    RETURN QUERY
    WITH view_counts AS (
        SELECT s.category_id, count(*) as v_count
        FROM site_analytics s
        WHERE s.event_type = 'page_view' AND s.category_id IS NOT NULL
        GROUP BY s.category_id
    ),
    click_counts AS (
        SELECT s.category_id, count(*) as c_count
        FROM site_analytics s
        WHERE s.event_type = 'get_deal_click' AND s.category_id IS NOT NULL
        GROUP BY s.category_id
    )
    SELECT 
        vc.category_id,
        vc.v_count as views,
        COALESCE(cc.c_count, 0) as clicks,
        CASE WHEN vc.v_count > 0 THEN (COALESCE(cc.c_count, 0)::NUMERIC / vc.v_count::NUMERIC) * 100 ELSE 0 END as ctr
    FROM view_counts vc
    LEFT JOIN click_counts cc ON vc.category_id = cc.category_id
    ORDER BY views DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
