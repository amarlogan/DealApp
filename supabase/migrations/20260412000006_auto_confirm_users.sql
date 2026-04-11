-- 1. Auto-confirm all users in Auth schema (Supabase internal)
-- This bypasses the need for email confirmation in local development.
UPDATE auth.users SET email_confirmed_at = NOW();

-- 2. Ensure all existing profiles have the admin role
UPDATE public.profiles SET role = 'admin';
