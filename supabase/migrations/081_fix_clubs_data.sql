-- 1. Ensure Clubs are public (everyone can see club name/details)
DROP POLICY IF EXISTS "Public clubs read" ON public.clubs;
CREATE POLICY "Public clubs read" ON public.clubs
FOR SELECT USING (true);

-- 2. Ensure Admin can manage clubs
DROP POLICY IF EXISTS "Admin manage clubs" ON public.clubs;
CREATE POLICY "Admin manage clubs" ON public.clubs
FOR ALL
USING (
  exists (
    select 1 from user_profiles
    where user_profiles.id = auth.uid()
    and user_profiles.role in ('admin', 'club_owner', 'super_admin')
  )
);

-- 3. Create a default club if none exists
INSERT INTO public.clubs (name, city, country, address)
SELECT 'Padel Club Pro', 'Amsterdam', 'NL', 'Kalverstraat 1'
WHERE NOT EXISTS (SELECT 1 FROM public.clubs);
