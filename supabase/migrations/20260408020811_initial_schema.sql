CREATE TYPE deal_status AS ENUM ('active', 'expired', 'pending_verification', 'hidden');

CREATE TABLE deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    merchant TEXT NOT NULL,
    external_url TEXT NOT NULL,
    current_price NUMERIC NOT NULL,
    original_price NUMERIC NOT NULL,
    discount_percentage NUMERIC DEFAULT 0,
    status deal_status DEFAULT 'active',
    category TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
    price NUMERIC NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Calculate 30-day average price vs. current price to generate "Deal Score" (1-10)
CREATE VIEW price_tracking AS
SELECT 
    d.id AS deal_id,
    d.current_price,
    COALESCE(AVG(ph.price), d.current_price) AS average_30_day_price,
    d.current_price < COALESCE(AVG(ph.price), d.current_price) AS is_price_drop,
    LEAST(GREATEST(1, ROUND(((COALESCE(AVG(ph.price), d.original_price) - d.current_price) / NULLIF(COALESCE(AVG(ph.price), d.original_price), 0)) * 10)), 10) AS deal_score
FROM deals d
LEFT JOIN price_history ph ON d.id = ph.deal_id AND ph.recorded_at >= NOW() - INTERVAL '30 days'
GROUP BY d.id, d.current_price, d.original_price;

CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, deal_id)
);

CREATE TABLE price_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
    target_price NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE seasons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    css_variables JSONB NOT NULL
);

-- Trigger for discount_percentage
CREATE OR REPLACE FUNCTION update_discount_percentage()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.original_price > 0 THEN
        NEW.discount_percentage := ROUND(((NEW.original_price - NEW.current_price) / NEW.original_price) * 100, 2);
    ELSE
        NEW.discount_percentage := 0;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_discount
BEFORE INSERT OR UPDATE OF current_price, original_price ON deals
FOR EACH ROW
EXECUTE FUNCTION update_discount_percentage();

-- Row Level Security (RLS)
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
CREATE POLICY read_all_deals ON deals FOR SELECT USING (true);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_favorites_isolation ON favorites
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_price_alerts_isolation ON price_alerts
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Theme Seeds
INSERT INTO seasons (name, start_date, end_date, css_variables) VALUES
('Spring Sale', '2026-03-01', '2026-05-31', '{"--primary": "#a8e6cf", "--background": "#fdffcd", "--text": "#333"}'),
('Black Friday', '2026-11-01', '2026-11-30', '{"--primary": "#ff4d4d", "--background": "#1a1a1a", "--text": "#fff"}');
