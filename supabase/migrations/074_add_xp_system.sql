-- Add XP and Level to user_profiles
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS xp integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS level integer DEFAULT 1;

-- Optional: Create a function to calculate level based on XP?
-- For now we'll handle it in the application logic for flexibility.
