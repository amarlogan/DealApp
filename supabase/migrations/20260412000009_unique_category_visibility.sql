-- Ensure uniqueness for category mapping in UI tables
-- This allows UPSERT operations in the Admin API to work correctly

-- 1. Navigation Items
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'navigation_items_category_id_key'
    ) THEN
        ALTER TABLE navigation_items ADD CONSTRAINT navigation_items_category_id_key UNIQUE (category_id);
    END IF;
END $$;

-- 2. Landing Sections
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'landing_sections_category_id_key'
    ) THEN
        ALTER TABLE landing_sections ADD CONSTRAINT landing_sections_category_id_key UNIQUE (category_id);
    END IF;
END $$;
