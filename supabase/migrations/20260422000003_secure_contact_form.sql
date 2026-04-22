-- Remove the completely public insert policy for contact forms
-- This is now securely handled entirely by the Next.js API route 
-- (which performs Turnstile CAPTCHA validation and uses the Service Role Key).
DROP POLICY IF EXISTS "Anyone can submit a contact form" ON public.contact_submissions;
