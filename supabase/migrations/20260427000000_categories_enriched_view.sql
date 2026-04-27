-- ─────────────────────────────────────────────────────────────────────────────
-- DealNexus: Dynamic Category Visibility View
-- ─────────────────────────────────────────────────────────────────────────────

-- Create a view that enrichment categories with their active deal count
CREATE OR REPLACE VIEW categories_enriched AS
SELECT 
    c.*,
    (
        SELECT count(*) 
        FROM deals d 
        WHERE d.category_id = c.id 
        AND d.status = 'active' 
        AND d.in_stock = true
    ) as active_deal_count
FROM categories c;

-- Grant access to the view
GRANT SELECT ON categories_enriched TO anon, authenticated, service_role;

-- Ensure navigation items can still be fetched with this information
-- (Optional: you can also create a view for navigation_items if preferred)
