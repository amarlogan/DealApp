-- ─────────────────────────────────────────────────────────────────────────────
-- DealNexus: Dynamic Categories and UI Configuration Migration
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Categories Master Table ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
    id                  TEXT        PRIMARY KEY, -- e.g., 'electronics'
    label               TEXT        NOT NULL,
    emoji               TEXT        NOT NULL,
    description         TEXT,
    phase               INTEGER     DEFAULT 1,   -- 1 = active, 2 = coming soon
    is_active           BOOLEAN     DEFAULT true,
    sort_order          INTEGER     DEFAULT 0,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Turn on RLS for categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS read_all_categories ON categories;
CREATE POLICY read_all_categories ON categories FOR SELECT USING (true);

-- Seed Categories
INSERT INTO categories (id, label, emoji, description, phase, sort_order) VALUES
('electronics',  'Electronics',          '⚡',  'TVs, headphones, phones & more',    1, 10),
('home-kitchen', 'Home & Kitchen',       '🏠',  'Appliances, cookware & decor',      1, 20),
('fashion',      'Fashion & Apparel',    '👗',  'Clothing, suits & accessories',     1, 30),
('shoes',        'Shoes & Sneakers',     '👟',  'Nike, Adidas & top brands',         1, 40),
('sports',       'Sports & Outdoors',    '🏃',  'Fitness, camping & adventure',      1, 50),
('toys',         'Toys & Games',         '🧸',  'Kids, games & entertainment',       1, 60),
('beauty',       'Beauty & Personal Care','💄', 'Skincare, makeup & grooming',       2, 70),
('food',         'Food & Dining',        '🍽️', 'Restaurants & food subscriptions',  2, 80),
('travel',       'Travel & Hotels',      '✈️',  'Flights, hotels & experiences',     2, 90),
('auto',         'Auto & Tools',         '🔧',  'Car accessories & hardware',        2, 100),
('health',       'Health & Wellness',    '💊', 'Vitamins, fitness & care',          1, 110),
('pets',         'Pet Supplies',         '🐶', 'Food, toys & accessories',          1, 120),
('books',        'Books & Audible',      '📚', 'Bestsellers & audiobooks',          1, 130),
('software',     'Software & Apps',      '💻', 'Subscriptions & digital goods',     1, 140),
('gaming',       'Video Games',          '🎮', 'Consoles, PC & accessories',        1, 150),
('grocery',      'Groceries & Daily',    '🛒', 'Pantry staples & fresh food',       1, 160),
('office',       'Office Supplies',      '📎', 'Desks, chairs & stationery',        1, 170)
ON CONFLICT (id) DO UPDATE SET 
    label = EXCLUDED.label, 
    emoji = EXCLUDED.emoji,
    phase = EXCLUDED.phase;

-- Create 'other' category for unresolved deals to enforce FK constraint safely
INSERT INTO categories (id, label, emoji, description, phase, is_active, sort_order) 
VALUES ('other', 'Other Deals', '🏷️', 'Miscellaneous deals', 1, false, 999) 
ON CONFLICT (id) DO NOTHING;

-- Map Deals Category ID securely
-- Attempt to safely alter external data mapping constraints without breaking
DO $$ BEGIN
    -- Ensure any deal without a valid category has a fallback before establishing FK
    UPDATE deals SET category_id = 'other' WHERE category_id NOT IN (SELECT id FROM categories);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

ALTER TABLE deals
    ADD CONSTRAINT fk_deal_category
    FOREIGN KEY (category_id) REFERENCES categories(id)
    ON DELETE SET DEFAULT;


-- ── 2. Top Navigation Items Table ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS navigation_items (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id         TEXT        REFERENCES categories(id) ON DELETE CASCADE,
    label_override      TEXT,       -- If null, uses category label
    href                TEXT,       -- Absolute/relative link if not a category
    is_visible          BOOLEAN     DEFAULT true,
    is_highlighted      BOOLEAN     DEFAULT false,  -- Highlight styling (e.g., '🔥 All Deals')
    sort_order          INTEGER     DEFAULT 0,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE navigation_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS read_all_navigation ON navigation_items;
CREATE POLICY read_all_navigation ON navigation_items FOR SELECT USING (is_visible = true);

-- Seed Navigation
INSERT INTO navigation_items (category_id, label_override, href, is_highlighted, sort_order) VALUES
(NULL, '🔥 All Deals', '/deals', true, 0),
('electronics', NULL, NULL, false, 10),
('home-kitchen', NULL, NULL, false, 20),
('fashion', NULL, NULL, false, 30),
('shoes', NULL, NULL, false, 40),
('sports', NULL, NULL, false, 50),
('toys', NULL, NULL, false, 60),
('beauty', NULL, NULL, false, 70),
('food', NULL, NULL, false, 80),
('travel', NULL, NULL, false, 90),
('auto', NULL, NULL, false, 100),
('health', NULL, NULL, false, 110),
('pets', NULL, NULL, false, 120),
('books', NULL, NULL, false, 130),
('software', NULL, NULL, false, 140),
('gaming', NULL, NULL, false, 150),
('grocery', NULL, NULL, false, 160),
('office', NULL, NULL, false, 170);

-- ── 3. Landing Page Sections Configure ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS landing_sections (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id         TEXT        REFERENCES categories(id) ON DELETE CASCADE,
    title               TEXT,       -- Override for carousel title (uses Category label otherwise)
    is_visible          BOOLEAN     DEFAULT true,
    sort_order          INTEGER     DEFAULT 0,
    max_items           INTEGER     DEFAULT 15,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE landing_sections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS read_all_landing ON landing_sections;
CREATE POLICY read_all_landing ON landing_sections FOR SELECT USING (is_visible = true);

-- Seed Landing Page Categories (Phase 1 components)
INSERT INTO landing_sections (category_id, title, sort_order) VALUES
('electronics', NULL, 10),
('home-kitchen', NULL, 20),
('fashion', NULL, 30),
('shoes', NULL, 40),
('sports', NULL, 50),
('toys', NULL, 60);
