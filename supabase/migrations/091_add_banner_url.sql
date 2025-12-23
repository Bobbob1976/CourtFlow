-- Add banner_url to clubs if it doesn't exist
ALTER TABLE public.clubs 
ADD COLUMN IF NOT EXISTS banner_url text;

-- Allow public read of clubs (already done, but just to be sure)
DROP POLICY IF EXISTS "Public clubs read 2" ON public.clubs;
CREATE POLICY "Public clubs read 2" ON public.clubs
FOR SELECT USING (true);
