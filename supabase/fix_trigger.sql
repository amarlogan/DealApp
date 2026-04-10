-- Fix: re-create profile trigger with explicit search_path to bypass RLS correctly
CREATE OR REPLACE FUNCTION public.fn_create_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant service_role bypass on profiles (so inserts from triggers work)
GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.profiles TO postgres;
