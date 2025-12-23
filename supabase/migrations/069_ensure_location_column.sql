-- Ensure 'location' and 'avatar_url' columns exist
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS location text DEFAULT 'Amsterdam';

ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS avatar_url text;

-- Grant permissions just in case
GRANT SELECT, UPDATE ON public.user_profiles TO authenticated;
GRANT SELECT ON public.user_profiles TO anon;

-- Force Supabase API to recognize the new columns immediately
NOTIFY pgrst, 'reload schema';
