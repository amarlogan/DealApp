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
    SELECT 'Views' as step, count(*) as count FROM public.site_analytics WHERE event_type = 'page_view'
    UNION ALL
    SELECT 'Clicks' as step, count(*) as count FROM public.site_analytics WHERE event_type = 'get_deal_click';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
