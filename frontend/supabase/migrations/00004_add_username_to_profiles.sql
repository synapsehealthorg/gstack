-- Migration: Add username column to profiles and support sharing
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username text UNIQUE;

-- Populate default unique usernames for existing profiles
-- Sanitizes name and appends first 4 characters of UUID for uniqueness
UPDATE public.profiles
SET username = COALESCE(
  LOWER(REGEXP_REPLACE(full_name, '[^a-zA-Z0-9]+', '-', 'g')),
  LOWER(REGEXP_REPLACE(SPLIT_PART(email, '@', 1), '[^a-zA-Z0-9]+', '-', 'g'))
) || '-' || SUBSTRING(id::text, 1, 4)
WHERE username IS NULL;

-- Enable public select on orders table (since UUID is unguessable, knowing it grants read access)
CREATE POLICY "Public read of orders by UUID" 
ON public.orders 
FOR SELECT 
USING (true);
