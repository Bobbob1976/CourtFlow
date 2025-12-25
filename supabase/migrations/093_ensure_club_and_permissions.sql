-- 1. Ensure a club exists
INSERT INTO public.clubs (name, city, country, address, banner_position_y)
SELECT 'Padel Club Pro', 'Amsterdam', 'NL', 'Hoofdstraat 1', 20
WHERE NOT EXISTS (SELECT 1 FROM public.clubs);

-- 2. Force Public Read Access on Clubs (fix "No club found")
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public clubs read force" ON public.clubs;
CREATE POLICY "Public clubs read force" ON public.clubs
FOR SELECT USING (true);

-- 3. Allow Admins to Update Clubs (for Banner Settings)
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
