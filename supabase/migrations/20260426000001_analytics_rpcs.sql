-- Migration: Advanced Analytics RPCs

-- 1. Price Range Analysis
CREATE OR REPLACE FUNCTION public.get_price_range_analytics()
RETURNS TABLE(price_range TEXT, clicks BIGINT) AS $$
BEGIN
    RETURN QUERY
    WITH buckets AS (
        SELECT 
            CASE 
                WHEN d.current_price < 25 THEN '$0-$25'
                WHEN d.current_price >= 25 AND d.current_price < 100 THEN '$25-$100'
                ELSE '$100+'
            END as bucket
        FROM public.site_analytics s
        JOIN public.deals d ON s.deal_id = d.id
        WHERE s.event_type = 'get_deal_click'
    )
    SELECT bucket as price_range, count(*) as clicks
    FROM buckets
    GROUP BY bucket
    ORDER BY 
        CASE bucket 
            WHEN '$0-$25' THEN 1 
            WHEN '$25-$100' THEN 2 
            ELSE 3 
        END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Conversion Funnel
CREATE OR REPLACE FUNCTION public.get_funnel_analytics()
RETURNS TABLE(step TEXT, count BIGINT) AS $$
BEGIN
    RETURN QUERY
    WITH ordered_steps AS (
        SELECT 'Views' as step, count(*) as count, 1 as sort_order FROM public.site_analytics WHERE event_type = 'page_view'
        UNION ALL
        SELECT 'Clicks' as step, count(*) as count, 2 as sort_order FROM public.site_analytics WHERE event_type = 'get_deal_click'
    )
    SELECT o.step, o.count FROM ordered_steps o ORDER BY o.sort_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Analytics Summary (Fixed for robustness & auth access)
CREATE OR REPLACE FUNCTION public.get_analytics_summary()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_views', COALESCE((SELECT count(*) FROM public.site_analytics WHERE event_type = 'page_view'), 0),
        'total_clicks', COALESCE((SELECT count(*) FROM public.site_analytics WHERE event_type = 'get_deal_click'), 0),
        'unique_users', COALESCE((SELECT count(DISTINCT user_id) FROM public.site_analytics), 0),
        'anonymous_users', COALESCE((SELECT count(DISTINCT s.user_id) FROM public.site_analytics s LEFT JOIN auth.users u ON s.user_id = u.id WHERE u.email IS NULL), 0),
        'today_views', COALESCE((SELECT count(*) FROM public.site_analytics WHERE event_type = 'page_view' AND created_at > now() - interval '24 hours'), 0),
        'today_clicks', COALESCE((SELECT count(*) FROM public.site_analytics WHERE event_type = 'get_deal_click' AND created_at > now() - interval '24 hours'), 0)
    ) INTO result;
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- 4. Category Performance (Fixed to parse path for historical data)
CREATE OR REPLACE FUNCTION public.get_category_analytics()
RETURNS TABLE(category_id TEXT, views BIGINT, clicks BIGINT, ctr NUMERIC) AS $$
BEGIN
    RETURN QUERY
    WITH normalized_analytics AS (
        SELECT 
            s.event_type,
            COALESCE(s.category_id, 
                CASE 
                    WHEN s.path LIKE '/category/%' THEN split_part(s.path, '/', 3)
                    ELSE NULL 
                END
            ) as cat_id
        FROM public.site_analytics s
    ),
    view_counts AS (
        SELECT cat_id as category_id, count(*) as v_count
        FROM normalized_analytics
        WHERE event_type = 'page_view' AND cat_id IS NOT NULL AND cat_id != ''
        GROUP BY cat_id
    ),
    click_counts AS (
        SELECT cat_id as category_id, count(*) as c_count
        FROM normalized_analytics
        WHERE event_type = 'get_deal_click' AND cat_id IS NOT NULL AND cat_id != ''
        GROUP BY cat_id
    )
    SELECT 
        vc.category_id,
        vc.v_count as views,
        COALESCE(cc.c_count, 0) as clicks,
        CASE WHEN vc.v_count > 0 THEN ROUND((COALESCE(cc.c_count, 0)::NUMERIC / vc.v_count::NUMERIC) * 100, 2) ELSE 0 END as ctr
    FROM view_counts vc
    LEFT JOIN click_counts cc ON vc.category_id = cc.category_id
    ORDER BY views DESC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
