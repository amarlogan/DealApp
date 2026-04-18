-- 20260412000012_notifications_system.sql
-- Implement a functional notification system

-- 1. Create Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info', -- 'price_drop', 'news', 'promotion', 'info'
    link TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own notifications') THEN
        CREATE POLICY "Users can view their own notifications" 
            ON public.notifications FOR SELECT 
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own notifications') THEN
        CREATE POLICY "Users can update their own notifications" 
            ON public.notifications FOR UPDATE 
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage all notifications') THEN
        CREATE POLICY "Admins can manage all notifications" 
            ON public.notifications FOR ALL 
            USING (is_admin());
    END IF;
END $$;

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);

-- 5. Seed initial notifications for testing
DO $$
DECLARE
    admin_id UUID;
BEGIN
    SELECT p.id INTO admin_id 
    FROM public.profiles p
    JOIN auth.users u ON p.id = u.id
    WHERE u.email = 'admin@test.com' 
    LIMIT 1;
    
    IF admin_id IS NOT NULL THEN
        -- Link notifications to admin for testing
        INSERT INTO public.notifications (user_id, title, content, type, link)
        VALUES 
        (admin_id, 'Price Drop Alert!', 'Sony WH-1000XM5 Headphones just hit your target price of $299!', 'price_drop', '/deals/sony-xm5'),
        (admin_id, 'Welcome to DealNexus', 'Check out the new homepage layout and customized hero banners.', 'info', '/'),
        (admin_id, 'New Seasonal Sale', 'The Spring Sale is now live! Explore top deals in Fashion and Outdoors.', 'news', '/category/fashion')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;
