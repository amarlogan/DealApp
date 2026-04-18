-- ─────────────────────────────────────────────────────────────────────────────
-- DealNexus: Community Features (Comments & Ratings)
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Deal Ratings ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS deal_ratings (
    deal_id     UUID        REFERENCES deals(id) ON DELETE CASCADE,
    user_id     UUID        REFERENCES auth.users(id) ON DELETE CASCADE,
    rating      INTEGER     CHECK (rating >= 1 AND rating <= 5),
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (deal_id, user_id)
);

-- ── Comments ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS comments (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id     UUID        REFERENCES deals(id) ON DELETE CASCADE,
    user_id     UUID        REFERENCES auth.users(id) ON DELETE CASCADE,
    parent_id   UUID        REFERENCES comments(id) ON DELETE CASCADE, -- threads
    content     TEXT        NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Trigger: Sync Aggregate Rating ───────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_sync_deal_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE deals
    SET 
        rating = COALESCE((SELECT AVG(rating) FROM deal_ratings WHERE deal_id = NEW.deal_id), 0),
        review_count = (SELECT COUNT(*) FROM deal_ratings WHERE deal_id = NEW.deal_id)
    WHERE id = NEW.deal_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_sync_rating_after_upsert
AFTER INSERT OR UPDATE ON deal_ratings
FOR EACH ROW EXECUTE FUNCTION fn_sync_deal_rating();

CREATE TRIGGER trg_sync_rating_after_delete
AFTER DELETE ON deal_ratings
FOR EACH ROW EXECUTE FUNCTION fn_sync_deal_rating();

-- ── RLS Policies ─────────────────────────────────────────────────────────────

ALTER TABLE deal_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments     ENABLE ROW LEVEL SECURITY;

-- Ratings: Anyone can read, users manage their own
CREATE POLICY rls_ratings_read ON deal_ratings
    FOR SELECT USING (true);

CREATE POLICY rls_ratings_upsert ON deal_ratings
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Comments: Anyone can read, users manage their own
CREATE POLICY rls_comments_read ON comments
    FOR SELECT USING (true);

CREATE POLICY rls_comments_post ON comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY rls_comments_manage ON comments
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY rls_comments_delete ON comments
    FOR DELETE USING (auth.uid() = user_id);

-- ── Indexing for Performance ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_comments_deal_id ON comments(deal_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_deal_ratings_deal_id ON deal_ratings(deal_id);
