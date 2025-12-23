-- Add location and avatar_url columns to user_profiles if they don't exist
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS location text DEFAULT 'Amsterdam',
ADD COLUMN IF NOT EXISTS avatar_url text;

-- Ensure RLS allows users to update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile" 
ON public.user_profiles FOR UPDATE
USING (auth.uid() = id);
