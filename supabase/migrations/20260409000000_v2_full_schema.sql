-- ─────────────────────────────────────────────────────────────────────────────
-- DealNexus: Full Schema Migration v2
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Enums ────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE deal_status AS ENUM ('active', 'expired', 'pending_verification', 'hidden');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── Deals (extended) ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS deals (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Core content
    title               TEXT        NOT NULL,
    description         TEXT,
    merchant            TEXT        NOT NULL,           -- display only, e.g. "Nike"
    external_url        TEXT        NOT NULL,            -- merchant's product page
    affiliate_url       TEXT,                           -- tracked affiliate link
    image_url           TEXT,

    -- Pricing
    current_price       NUMERIC     NOT NULL,
    original_price      NUMERIC     NOT NULL,
    discount_percentage NUMERIC     DEFAULT 0,

    -- Product metadata
    category_id         TEXT        NOT NULL DEFAULT 'other',  -- 'electronics','shoes', etc.
    badge               TEXT,                           -- 'Best Seller', 'Hot Deal', etc.
    promo_code          TEXT,
    in_stock            BOOLEAN     DEFAULT true,
    is_popular          BOOLEAN     DEFAULT false,
    rating              NUMERIC(3,1) DEFAULT 0,
    review_count        INTEGER     DEFAULT 0,
    location            TEXT,                           -- for local phase 2 deals

    -- Scraper dedup
    external_id         TEXT        UNIQUE,             -- e.g. amazon ASIN

    -- Lifecycle
    status              deal_status DEFAULT 'active',
    expires_at          TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── Patch V1 deals table with V2 columns (idempotent) ────────────────────────
ALTER TABLE deals ADD COLUMN IF NOT EXISTS affiliate_url       TEXT;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS image_url           TEXT;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS category_id         TEXT NOT NULL DEFAULT 'other';
ALTER TABLE deals ADD COLUMN IF NOT EXISTS badge               TEXT;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS promo_code          TEXT;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS in_stock            BOOLEAN DEFAULT true;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS is_popular          BOOLEAN DEFAULT false;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS rating              NUMERIC(3,1) DEFAULT 0;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS review_count        INTEGER DEFAULT 0;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS location            TEXT;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS external_id         TEXT;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS expires_at          TIMESTAMPTZ;
-- Add UNIQUE constraint on external_id if not already present
DO $$ BEGIN
  ALTER TABLE deals ADD CONSTRAINT deals_external_id_key UNIQUE (external_id);
EXCEPTION WHEN duplicate_table THEN NULL;
          WHEN duplicate_object THEN NULL; END $$;
-- Rename old category column if it exists (V1 used TEXT[], V2 uses category_id TEXT)
DO $$ BEGIN
  ALTER TABLE deals RENAME COLUMN category TO category_old;
EXCEPTION WHEN undefined_column THEN NULL; END $$;

-- ── Price History ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS price_history (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id     UUID        REFERENCES deals(id) ON DELETE CASCADE,
    price       NUMERIC     NOT NULL,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Price Tracking View (30-day avg + Deal Score) ────────────────────────────
CREATE OR REPLACE VIEW price_tracking AS
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

-- ── User Profiles ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
    id                  UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name        TEXT,
    avatar_url          TEXT,
    interests           TEXT[]      DEFAULT '{}',   -- array of category_ids
    notification_email  BOOLEAN     DEFAULT true,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── Favorites ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS favorites (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID        REFERENCES auth.users(id) ON DELETE CASCADE,
    deal_id     UUID        REFERENCES deals(id)  ON DELETE CASCADE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, deal_id)
);

-- ── Price Alerts ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS price_alerts (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID        REFERENCES auth.users(id) ON DELETE CASCADE,
    deal_id      UUID        REFERENCES deals(id)  ON DELETE CASCADE,
    target_price NUMERIC,               -- alert when price drops below this
    is_active    BOOLEAN     DEFAULT true,
    notified_at  TIMESTAMPTZ,           -- last time notification was sent
    created_at   TIMESTAMPTZ DEFAULT NOW()
);
-- ── Patch V1 price_alerts table with V2 columns ───────────────────────────────
ALTER TABLE price_alerts ADD COLUMN IF NOT EXISTS is_active    BOOLEAN DEFAULT true;
ALTER TABLE price_alerts ADD COLUMN IF NOT EXISTS notified_at  TIMESTAMPTZ;

-- ── Deal Clicks (affiliate tracking) ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS deal_clicks (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id     UUID        REFERENCES deals(id) ON DELETE CASCADE,
    user_id     UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
    ip_address  TEXT,
    user_agent  TEXT,
    referer     TEXT,
    clicked_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Seasons (Theming) ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS seasons (
    id            UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    name          TEXT    NOT NULL,
    start_date    DATE    NOT NULL,
    end_date      DATE    NOT NULL,
    css_variables JSONB   NOT NULL
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Triggers
-- ─────────────────────────────────────────────────────────────────────────────

-- Auto-calculate discount_percentage on price change
CREATE OR REPLACE FUNCTION fn_update_discount()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.original_price > 0 THEN
        NEW.discount_percentage := ROUND(
            ((NEW.original_price - NEW.current_price) / NEW.original_price) * 100, 2
        );
    ELSE
        NEW.discount_percentage := 0;
    END IF;
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_discount ON deals;
CREATE TRIGGER trg_discount
BEFORE INSERT OR UPDATE OF current_price, original_price ON deals
FOR EACH ROW EXECUTE FUNCTION fn_update_discount();

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION fn_create_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, display_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)))
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_create_profile ON auth.users;
CREATE TRIGGER trg_create_profile
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION fn_create_profile();

-- ─────────────────────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE deals       ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites   ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles    ENABLE ROW LEVEL SECURITY;

-- Deals: anyone can read active deals
-- Drop V1 policy names first (idempotent)
DROP POLICY IF EXISTS read_all_deals ON deals;
DROP POLICY IF EXISTS user_favorites_isolation ON favorites;
DROP POLICY IF EXISTS user_price_alerts_isolation ON price_alerts;
DROP POLICY IF EXISTS rls_deals_read ON deals;
CREATE POLICY rls_deals_read ON deals
    FOR SELECT USING (status = 'active');

-- Favorites: users see/manage only their own
DROP POLICY IF EXISTS rls_favorites ON favorites;
CREATE POLICY rls_favorites ON favorites
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Price Alerts: users see/manage only their own
DROP POLICY IF EXISTS rls_alerts ON price_alerts;
CREATE POLICY rls_alerts ON price_alerts
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Deal Clicks: users can insert; admins read all
DROP POLICY IF EXISTS rls_clicks_insert ON deal_clicks;
CREATE POLICY rls_clicks_insert ON deal_clicks
    FOR INSERT WITH CHECK (true);   -- allow anon inserts (we validate server-side)

-- Profiles: users see/manage only their own
DROP POLICY IF EXISTS rls_profiles ON profiles;
CREATE POLICY rls_profiles ON profiles
    FOR ALL USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Seed: Seasons
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO seasons (name, start_date, end_date, css_variables) VALUES
('Spring Sale', '2026-03-01', '2026-05-31',
 '{"--primary":"#53A318","--background":"#f0f7fb","--text":"#111827"}'),
('Black Friday', '2026-11-01', '2026-11-30',
 '{"--primary":"#ff4d4d","--background":"#0a0a0a","--text":"#ffffff"}')
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- Seed: Demo Deals (remove in production — use scraper)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO deals (title, description, merchant, external_url, affiliate_url, image_url,
                   current_price, original_price, category_id, badge, rating, review_count,
                   is_popular, in_stock, external_id)
VALUES
  ('Sony WH-1000XM5 Wireless Noise Canceling Headphones',
   'Industry-leading noise cancellation. Up to 30-hour battery. Multipoint connection.',
   'Amazon', 'https://amazon.com/dp/B09XS7JWHH',
   'https://amazon.com/dp/B09XS7JWHH?tag=REPLACE_TAG',
   'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
   278.00, 399.99, 'electronics', 'Best Seller', 4.8, 28412, true, true, 'amz-B09XS7JWHH'),

  ('Apple AirPods Pro (2nd Gen) with USB-C Charging Case',
   'Active Noise Cancellation. Adaptive Audio. Up to 30 hours total listening.',
   'Apple / Amazon', 'https://amazon.com/dp/B0BDHWDR12',
   'https://amazon.com/dp/B0BDHWDR12?tag=REPLACE_TAG',
   'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&q=80',
   189.99, 249.00, 'electronics', 'Amazon Choice', 4.9, 74123, true, true, 'amz-B0BDHWDR12'),

  ('Samsung 65" QLED 4K Smart TV 2024',
   'Quantum Processor 4K. Real Depth Enhancer. Object Tracking Sound+.',
   'Samsung', 'https://amazon.com/dp/B0BVF71FJK',
   'https://amazon.com/dp/B0BVF71FJK?tag=REPLACE_TAG',
   'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&q=80',
   997.99, 1599.99, 'electronics', 'Deal of the Day', 4.7, 11089, true, true, 'amz-B0BVF71FJK'),

  ('Ninja Foodi 14-in-1 8qt XL Pressure Cooker & Air Fryer',
   'TenderCrisp Technology. 14 cooking functions. Fits 8lbs of chicken.',
   'Ninja', 'https://amazon.com/dp/B0C7J81K8K',
   'https://amazon.com/dp/B0C7J81K8K?tag=REPLACE_TAG',
   'https://images.unsplash.com/photo-1585515320310-259814833e62?w=800&q=80',
   149.95, 249.99, 'home-kitchen', 'Hot Deal', 4.7, 19302, true, true, 'amz-B0C7J81K8K'),

  ('Dyson V15 Detect Cordless Vacuum',
   'Laser Detect reveals invisible dust. HEPA filtration. Up to 60 min run time.',
   'Dyson', 'https://amazon.com/dp/B09KXSDM3X',
   'https://amazon.com/dp/B09KXSDM3X?tag=REPLACE_TAG',
   'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
   549.99, 749.99, 'home-kitchen', null, 4.6, 9874, false, true, 'amz-B09KXSDM3X'),

  ('KitchenAid Artisan 5-Qt Stand Mixer — Empire Red',
   '10 speeds. Tilt-head design. 59-point planetary mixing action.',
   'KitchenAid', 'https://walmart.com/ip/KitchenAid-Artisan/34593843',
   'https://walmart.com/ip/KitchenAid-Artisan/34593843?affiliates_ad=REPLACE_TAG',
   'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=800&q=80',
   329.99, 499.99, 'home-kitchen', null, 4.9, 33188, true, true, 'wmt-34593843'),

  ('Nike Air Max 270 React Men''s Shoes',
   'Max Air heel unit. React foam midsole. Lightweight mesh upper.',
   'Nike', 'https://nike.com/t/air-max-270-react/CT1670-001',
   'https://nike.com/t/air-max-270-react/CT1670-001?cp=REPLACE_TAG',
   'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
   89.97, 150.00, 'shoes', 'Sale', 4.7, 8912, true, true, 'nike-CT1670-001'),

  ('Nike Air Force 1 ''07 Women''s Shoes — Triple White',
   'Iconic AF1. Leather upper. Padded collar. Full-length Air-Sole unit.',
   'Nike', 'https://nike.com/t/air-force-1-07/DD8959-100',
   'https://nike.com/t/air-force-1-07/DD8959-100?cp=REPLACE_TAG',
   'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800&q=80',
   74.97, 100.00, 'shoes', null, 4.9, 54302, true, true, 'nike-DD8959-100'),

  ('Adidas Ultraboost 22 Running Shoes',
   '50% Parley Ocean Plastic. Responsive BOOST midsole. Continental rubber outsole.',
   'Adidas', 'https://adidas.com/us/ultraboost-22/GX5462.html',
   'https://adidas.com/us/ultraboost-22/GX5462.html?cp=REPLACE_TAG',
   'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
   99.99, 190.00, 'shoes', 'Hot Deal', 4.8, 12044, true, true, 'adidas-GX5462'),

  ('H&M Slim-Fit Stretch Suit — Navy Blue',
   'Smart slim-fit jacket. Notch lapels. Matching flat-front trousers. Stretch fabric.',
   'H&M', 'https://hm.com/product/1234567890',
   'https://hm.com/product/1234567890?cp=REPLACE_TAG',
   'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&q=80',
   79.99, 149.99, 'fashion', null, 4.5, 3421, false, true, 'hm-suit-navy'),

  ('Levi''s 501 Original Fit Jeans',
   'Straight leg since 1873. Button fly. 99% cotton for a lived-in feel.',
   'Levi''s', 'https://amazon.com/dp/B00IEJ9D3W',
   'https://amazon.com/dp/B00IEJ9D3W?tag=REPLACE_TAG',
   'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80',
   39.99, 69.50, 'fashion', null, 4.6, 41320, true, true, 'amz-B00IEJ9D3W'),

  ('Zara Oversized Linen Blazer — Ecru',
   'Relaxed oversized cut in lightweight linen blend. Button front. Fully lined.',
   'Zara', 'https://zara.com/us/linen-blazer-p09163741.html',
   'https://zara.com/us/linen-blazer-p09163741.html?cp=REPLACE_TAG',
   'https://images.unsplash.com/photo-1592878849122-facb97ed9cfe?w=800&q=80',
   69.90, 99.90, 'fashion', 'Sale', 4.6, 1892, false, true, 'zara-09163741'),

  ('Shark AI Ultra Robot Vacuum with Self-Empty Base',
   'HEPA self-empty base holds 60 days of dirt. AI Laser Vision mapping. 2-in-1 vacuum + mop.',
   'Shark', 'https://amazon.com/dp/B0C4FQWQ2F',
   'https://amazon.com/dp/B0C4FQWQ2F?tag=REPLACE_TAG',
   'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800&q=80',
   399.99, 599.99, 'home-kitchen', null, 4.5, 7201, false, true, 'amz-B0C4FQWQ2F'),

  ('Google Pixel 8 Pro 128GB Unlocked',
   'Google Tensor G3. 50MP main + Telephoto + Ultrawide. 7 years of OS updates.',
   'Google', 'https://walmart.com/ip/Google-Pixel-8-Pro/782638592',
   'https://walmart.com/ip/Google-Pixel-8-Pro/782638592?affiliates_ad=REPLACE_TAG',
   'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80',
   699.00, 999.00, 'electronics', 'Rollback', 4.7, 5621, true, true, 'wmt-782638592'),

  ('Apple iPad (10th Gen) 64GB Wi-Fi',
   'A14 Bionic chip. 10.9-inch Liquid Retina display. 12MP cameras. USB-C.',
   'Apple', 'https://walmart.com/ip/Apple-iPad-2022/1230671890',
   'https://walmart.com/ip/Apple-iPad-2022/1230671890?affiliates_ad=REPLACE_TAG',
   'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80',
   299.00, 449.00, 'electronics', 'Rollback', 4.8, 45211, true, true, 'wmt-1230671890'),

  ('Ninja Professional Plus Blender with Auto-iQ',
   '1200-peak-watts. Total Crushing Technology. Auto-iQ preset programs.',
   'Ninja', 'https://amazon.com/dp/B01N9ZQHKP',
   'https://amazon.com/dp/B01N9ZQHKP?tag=REPLACE_TAG',
   'https://images.unsplash.com/photo-1570197571499-166b36435e9f?w=800&q=80',
   79.99, 129.99, 'home-kitchen', 'Best Seller', 4.8, 25891, true, true, 'amz-B01N9ZQHKP'),

  ('Instant Pot Duo 7-in-1 Pressure Cooker, 8 Quart',
   '7-in-1: pressure cooker, slow cooker, rice maker, yogurt maker, steamer, sauté, warmer.',
   'Instant Pot', 'https://walmart.com/ip/Instant-Pot-Duo/189978023',
   'https://walmart.com/ip/Instant-Pot-Duo/189978023?affiliates_ad=REPLACE_TAG',
   'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
   59.00, 99.95, 'home-kitchen', 'Clearance', 4.7, 62034, true, true, 'wmt-189978023')
ON CONFLICT (external_id) DO UPDATE SET
    current_price = EXCLUDED.current_price,
    updated_at    = NOW();
