-- 1. Create the bridge table locally
CREATE TABLE IF NOT EXISTS deal_seasons (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id             UUID        NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    season_id           UUID        NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(deal_id, season_id)
);

-- 2. Enable RLS
ALTER TABLE deal_seasons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS read_all_deal_seasons ON deal_seasons;
CREATE POLICY read_all_deal_seasons ON deal_seasons FOR SELECT USING (true);

-- 3. Refresh the API cache
NOTIFY pgrst, 'reload schema';
