-- ─────────────────────────────────────────────────────────────────────────────
-- DealNexus: Fix Rating Sync Trigger
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Redefine the sync function to handle DELETE correctly (by using OLD when NEW is null)
CREATE OR REPLACE FUNCTION fn_sync_deal_rating()
RETURNS TRIGGER AS $$
DECLARE
    target_deal_id UUID;
BEGIN
    target_deal_id := COALESCE(NEW.deal_id, OLD.deal_id);

    UPDATE deals
    SET 
        rating = COALESCE((SELECT AVG(rating)::NUMERIC(3,2) FROM deal_ratings WHERE deal_id = target_deal_id), 0),
        review_count = (SELECT COUNT(*) FROM deal_ratings WHERE deal_id = target_deal_id)
    WHERE id = target_deal_id;
    
    RETURN NULL; -- result is ignored since this is an AFTER trigger
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Add high-performance indexes for rating analytics
CREATE INDEX IF NOT EXISTS idx_deal_ratings_stats ON deal_ratings(deal_id, rating);
