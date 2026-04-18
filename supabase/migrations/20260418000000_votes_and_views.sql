-- 1. Add new columns for Votes and Views (if not already there)
ALTER TABLE deals ADD COLUMN IF NOT EXISTS upvotes INT DEFAULT 0;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS downvotes INT DEFAULT 0;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS view_count INT DEFAULT 0;

-- 2. Create RPC for atomic view incrementing
CREATE OR REPLACE FUNCTION increment_deal_view(target_deal_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE deals
    SET view_count = view_count + 1
    WHERE id = target_deal_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Consolidated Sync Function (Handles Votes & Stars)
CREATE OR REPLACE FUNCTION fn_sync_engagement_metrics()
RETURNS TRIGGER AS $$
DECLARE
    v_deal_id UUID;
BEGIN
    -- Determine deal_id based on operation
    IF (TG_OP = 'DELETE') THEN
        v_deal_id := OLD.deal_id;
    ELSE
        v_deal_id := NEW.deal_id;
    END IF;

    -- Update the deals table with fresh aggregates
    UPDATE deals
    SET 
        -- Star-based metrics (legacy)
        rating = COALESCE((SELECT AVG(rating) FROM deal_ratings WHERE deal_id = v_deal_id), 0),
        review_count = (SELECT COUNT(*) FROM deal_ratings WHERE deal_id = v_deal_id),
        
        -- Vote-based metrics (new)
        upvotes = (SELECT COUNT(*) FROM deal_ratings WHERE deal_id = v_deal_id AND rating > 3),
        downvotes = (SELECT COUNT(*) FROM deal_ratings WHERE deal_id = v_deal_id AND rating < 3)
    WHERE id = v_deal_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Re-install triggers
DROP TRIGGER IF EXISTS trg_sync_votes ON deal_ratings;
DROP TRIGGER IF EXISTS trg_sync_rating_after_upsert ON deal_ratings;
DROP TRIGGER IF EXISTS trg_sync_rating_after_delete ON deal_ratings;

CREATE TRIGGER trg_sync_engagement
AFTER INSERT OR UPDATE OR DELETE ON deal_ratings
FOR EACH ROW EXECUTE FUNCTION fn_sync_engagement_metrics();

-- 5. One-time sync to fix any existing data
UPDATE deals d
SET 
    rating = COALESCE((SELECT AVG(rating) FROM deal_ratings WHERE deal_id = d.id), 0),
    review_count = (SELECT COUNT(*) FROM deal_ratings WHERE deal_id = d.id),
    upvotes = (SELECT COUNT(*) FROM deal_ratings WHERE deal_id = d.id AND rating > 3),
    downvotes = (SELECT COUNT(*) FROM deal_ratings WHERE deal_id = d.id AND rating < 3);
