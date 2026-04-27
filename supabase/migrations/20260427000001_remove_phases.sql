-- ─────────────────────────────────────────────────────────────────────────────
-- DealNexus: Remove Rollout Phases Logic
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Update the view to remove phase but keep active_deal_count
CREATE OR REPLACE VIEW categories_enriched 
WITH (security_invoker = true)
AS
SELECT 
    c.id,
    c.label,
    c.emoji,
    c.description,
    c.is_active,
    c.sort_order,
    c.created_at,
    c.updated_at,
    (
        SELECT count(*) 
        FROM deals d 
        WHERE d.category_id = c.id 
        AND d.status = 'active' 
        AND d.in_stock = true
    ) as active_deal_count
FROM categories c;

-- 2. Remove the phase column from the master table
ALTER TABLE categories DROP COLUMN IF EXISTS phase;

-- 3. Re-grant permissions
GRANT SELECT ON categories_enriched TO anon, authenticated, service_role;
