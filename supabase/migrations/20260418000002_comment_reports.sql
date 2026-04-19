-- ─────────────────────────────────────────────────────────────────────────────
-- DealNexus: Comment Reporting System
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Create table for storing comment reports
CREATE TABLE IF NOT EXISTS public.comment_reports (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID        REFERENCES auth.users(id) ON DELETE CASCADE,
    comment_id  UUID        REFERENCES public.comments(id) ON DELETE CASCADE,
    reason      TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure a user can only report a specific comment once
    UNIQUE(user_id, comment_id)
);

-- 2. Enable Row Level Security
ALTER TABLE public.comment_reports ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
-- Users can insert their own reports
CREATE POLICY rls_reports_insert ON public.comment_reports
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Users can see their own reports
CREATE POLICY rls_reports_select_own ON public.comment_reports
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

-- Admins can see all reports
CREATE POLICY rls_reports_admin ON public.comment_reports
    FOR SELECT TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
      )
    );

-- 4. Indexing for performance
CREATE INDEX IF NOT EXISTS idx_comment_reports_comment_id ON public.comment_reports(comment_id);
