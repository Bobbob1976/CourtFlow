-- 1. Add banner_url if missing (redundant safety check)
ALTER TABLE public.clubs 
ADD COLUMN IF NOT EXISTS banner_url text;

-- 2. Add banner_position_y if missing (The Fix for the error)
ALTER TABLE public.clubs
ADD COLUMN IF NOT EXISTS banner_position_y integer DEFAULT 50;

-- 3. Ensure a club exists (Safely)
INSERT INTO public.clubs (name, city, country, address, banner_position_y)
SELECT 'Padel Club Pro', 'Amsterdam', 'NL', 'Hoofdstraat 1', 50
WHERE NOT EXISTS (SELECT 1 FROM public.clubs);

-- 4. Force Public Read Access on Clubs
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public clubs read force" ON public.clubs;
CREATE POLICY "Public clubs read force" ON public.clubs
FOR SELECT USING (true);

-- 5. Allow Admins to Update Clubs and Banner Settings
DROP POLICY IF EXISTS "Admin update clubs" ON public.clubs;
CREATE POLICY "Admin update clubs" ON public.clubs
FOR UPDATE
USING (
  exists (
    select 1 from user_profiles
    where user_profiles.id = auth.uid()
    and user_profiles.role in ('admin', 'club_owner', 'super_admin')
  )
);
