-- 1. EERST kolommen toevoegen (anders faalt de insert)
ALTER TABLE public.clubs 
ADD COLUMN IF NOT EXISTS city text DEFAULT 'Amsterdam',
ADD COLUMN IF NOT EXISTS country text DEFAULT 'NL',
ADD COLUMN IF NOT EXISTS address text DEFAULT '';

-- 2. DAN de rechten repareren
DROP POLICY IF EXISTS "Public clubs read" ON public.clubs;
CREATE POLICY "Public clubs read" ON public.clubs
FOR SELECT USING (true);

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

-- 3. ALS LAATSTE de data toevoegen (nu bestaan de kolommen wel)
INSERT INTO public.clubs (name, city, country, address)
SELECT 'Padel Club Pro', 'Amsterdam', 'NL', 'Kalverstraat 1'
WHERE NOT EXISTS (SELECT 1 FROM public.clubs);

-- Update existing clubs to have defaults
UPDATE public.clubs SET city = 'Amsterdam', country = 'NL' WHERE city IS NULL;
