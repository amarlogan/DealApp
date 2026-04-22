-- Add images array column to deals table
ALTER TABLE deals ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- Update RLS if necessary (usually not needed for just a column addition if existing policies are broad enough)
-- But let's ensure the admin can update it
-- The existing policies for deals are:
-- rls_deals_read: SELECT status = 'active'
-- Admin bypasses RLS via service role, so this is fine for the API.
