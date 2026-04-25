-- Create the site_analytics table for tracking user behavior
CREATE TABLE IF NOT EXISTS public.site_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    
    -- session info
    user_id UUID, -- Auth ID (can be anonymous or logged in)
    session_id TEXT, -- Optional client-side session ID
    
    -- event info
    event_type TEXT NOT NULL, -- 'page_view', 'deal_click', 'get_deal_click', 'search', etc.
    path TEXT, -- URL path
    
    -- entity links
    deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
    category_id TEXT,
    
    -- rich data
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    user_agent TEXT
);

-- Enable RLS
ALTER TABLE public.site_analytics ENABLE ROW LEVEL SECURITY;

-- Policies
-- 1. Anyone can insert (asynchronous tracking from frontend)
CREATE POLICY "Anyone can log analytics events"
    ON public.site_analytics
    FOR INSERT
    WITH CHECK (true);

-- 2. Only admins can view the data
CREATE POLICY "Admins can view analytics"
    ON public.site_analytics
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Indexes for performance
-- BRIN index is excellent for time-ordered data like logs
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON public.site_analytics USING BRIN (created_at);

-- Standard B-Tree indexes for filtering in the dashboard
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON public.site_analytics (event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_deal_id ON public.site_analytics (deal_id);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON public.site_analytics (user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_category_id ON public.site_analytics (category_id);
