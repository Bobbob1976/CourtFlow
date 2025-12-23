-- Add missing columns to clubs table if they don't exist
ALTER TABLE public.clubs 
ADD COLUMN IF NOT EXISTS city text DEFAULT 'Amsterdam',
ADD COLUMN IF NOT EXISTS country text DEFAULT 'NL',
ADD COLUMN IF NOT EXISTS address text DEFAULT '';

-- Update existing clubs with defaults so they aren't null
UPDATE public.clubs SET city = 'Amsterdam', country = 'NL' WHERE city IS NULL;
