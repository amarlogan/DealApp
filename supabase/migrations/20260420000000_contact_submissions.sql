-- Create the contact_submissions table
CREATE TABLE IF NOT EXISTS public.contact_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'closed')),
    user_id UUID REFERENCES auth.users(id) -- Optional: link to user if logged in
);

-- Enable RLS
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Policies
-- 1. Anyone can insert (to allow guest contact)
CREATE POLICY "Anyone can submit a contact form"
    ON public.contact_submissions
    FOR INSERT
    WITH CHECK (true);

-- 2. Only admins can view and update
-- Note: Simplified check, assuming admins have specific emails or a role flag in profiles
CREATE POLICY "Admins can manage contact submissions"
    ON public.contact_submissions
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );
