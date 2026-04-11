-- ─────────────────────────────────────────────────────────────────────────────
-- Performance Indexes Migration
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Index for Category-based queries on Deals
-- Speeds up category carousels and filtered searches.
CREATE INDEX IF NOT EXISTS idx_deals_category_status 
ON public.deals(category_id, status) 
WHERE status = 'active';

-- 2. Index for Popular/High Discount queries
-- Speeds up "Top Deals Today" and featured sections.
CREATE INDEX IF NOT EXISTS idx_deals_popular_discount 
ON public.deals(is_popular, discount_percentage DESC, status)
WHERE status = 'active';

-- 3. Index for Price History tracking
-- Speeds up the price_tracking view calculations for 30-day averages.
CREATE INDEX IF NOT EXISTS idx_price_history_deal_recorded 
ON public.price_history(deal_id, recorded_at DESC);

-- 4. Index for full-text search on Title and Merchant
-- Improves performance of the global search bar queries.
CREATE INDEX IF NOT EXISTS idx_deals_search_lookup
ON public.deals USING gin(to_tsvector('english', title || ' ' || merchant));
