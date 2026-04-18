-- ─────────────────────────────────────────────────────────────────────────────
-- DealNexus: Global Branding Refresh (Vibrancy Update)
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Update Spring Sale to use a more vibrant, high-saturation neon green
-- This ensures the top bar and site branding pop as requested.
UPDATE public.seasons
SET css_variables = '{
    "--primary": "#10b981", 
    "--primary-dark": "#059669", 
    "--primary-light": "#ecfdf5",
    "--background": "#f0f7fb", 
    "--text": "#111827"
}'
WHERE name = 'Spring Sale';

-- 2. Update Default Branding (if any)
-- (Fallbacks in case no season is active or for other components)
