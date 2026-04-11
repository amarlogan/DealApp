-- ─────────────────────────────────────────────────────────────────────────────
-- DealNexus: Seasonal Deals Many-to-Many Bridge and UI Config
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Deal Seasons Bridge Table ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS deal_seasons (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id             UUID        NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    season_id           UUID        NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(deal_id, season_id)
);

ALTER TABLE deal_seasons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS read_all_deal_seasons ON deal_seasons;
CREATE POLICY read_all_deal_seasons ON deal_seasons FOR SELECT USING (true);


-- ── 2. Update Landing Sections ───────────────────────────────────────────────
-- Allow a landing section to render a season instead of a category
ALTER TABLE landing_sections ADD COLUMN IF NOT EXISTS season_id UUID REFERENCES seasons(id) ON DELETE CASCADE;

-- Drop the constraint if it exists so we can safely re-add it
ALTER TABLE landing_sections DROP CONSTRAINT IF EXISTS chk_landing_section_type;

-- A section must have EITHER a category_id OR a season_id
ALTER TABLE landing_sections ADD CONSTRAINT chk_landing_section_type
    CHECK (
        (category_id IS NOT NULL AND season_id IS NULL) OR 
        (category_id IS NULL AND season_id IS NOT NULL)
    );


-- ── 3. Seed Demo Data ────────────────────────────────────────────────────────
DO $$ 
DECLARE
    spring_sale_id UUID;
    black_friday_id UUID;
BEGIN
    -- Get season IDs
    SELECT id INTO spring_sale_id FROM seasons WHERE name = 'Spring Sale' LIMIT 1;
    SELECT id INTO black_friday_id FROM seasons WHERE name = 'Black Friday' LIMIT 1;

    -- Add a few demo deals to the Spring Sale
    IF spring_sale_id IS NOT NULL THEN
        INSERT INTO deal_seasons (deal_id, season_id)
        SELECT id, spring_sale_id FROM deals LIMIT 4
        ON CONFLICT DO NOTHING;

        -- Add Spring Sale to landing page at the top (sort_order = 5)
        INSERT INTO landing_sections (season_id, title, sort_order)
        VALUES (spring_sale_id, 'Spring Sale', 5)
        ON CONFLICT DO NOTHING;
    END IF;

    -- Add a few demo deals to Black Friday
    IF black_friday_id IS NOT NULL THEN
        -- Link the next 4 deals
        INSERT INTO deal_seasons (deal_id, season_id)
        SELECT id, black_friday_id FROM deals OFFSET 4 LIMIT 4
        ON CONFLICT DO NOTHING;
    END IF;

END $$;
