-- ─────────────────────────────────────────────────────────────────────────────
-- Security Fixes Migration
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Harden price_tracking view
-- By default, views run as the owner (security definer). 
-- This switches it to security_invoker to respect RLS on underlying tables.
CREATE OR REPLACE VIEW public.price_tracking 
WITH (security_invoker = true)
AS
SELECT
    d.id                        AS deal_id,
    d.current_price,
    COALESCE(AVG(ph.price), d.original_price)   AS average_30_day_price,
    d.current_price < COALESCE(AVG(ph.price), d.original_price) AS is_price_drop,
    LEAST(GREATEST(1,
        ROUND(
            ((COALESCE(AVG(ph.price), d.original_price) - d.current_price)
             / NULLIF(COALESCE(AVG(ph.price), d.original_price), 0)) * 10
        )
    ), 10)                      AS deal_score
FROM deals d
LEFT JOIN price_history ph
       ON d.id = ph.deal_id
      AND ph.recorded_at >= NOW() - INTERVAL '30 days'
GROUP BY d.id, d.current_price, d.original_price;

-- 2. Enable RLS on price_history
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS rls_price_history_read ON public.price_history;
CREATE POLICY rls_price_history_read ON public.price_history
    FOR SELECT USING (true); -- Public read access for historical data

-- 3. Enable RLS on seasons
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS rls_seasons_read ON public.seasons;
CREATE POLICY rls_seasons_read ON public.seasons
    FOR SELECT USING (true); -- Public read access for thematic data
