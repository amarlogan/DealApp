-- Temporary promotion of all users to admin for development
UPDATE public.profiles SET role = 'admin';
