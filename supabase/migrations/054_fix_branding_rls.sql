-- 1. Zorg dat de kolommen bestaan (Idempotent: doet niks als ze er al zijn)
ALTER TABLE clubs 
ADD COLUMN IF NOT EXISTS logo_url text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS banner_url text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS primary_color text DEFAULT '#C4FF0D',
ADD COLUMN IF NOT EXISTS secondary_color text DEFAULT '#0A1628';

-- 2. FIX RLS VOOR CLUBS TABEL
-- We zetten RLS even tijdelijk uit en aan om zeker te zijn, of voegen een policy toe.
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;

-- Verwijder oude policies om conflicten te voorkomen
DROP POLICY IF EXISTS "Admins can update their club" ON clubs;
DROP POLICY IF EXISTS "Everyone can view clubs" ON clubs;

-- Policy: Iedereen mag clubs LEZEN (nodig voor booking page)
CREATE POLICY "Everyone can view clubs" 
ON clubs FOR SELECT 
USING (true);

-- Policy: Alleen ingelogde gebruikers (admins) mogen UPDATEN
-- Voor nu staan we elke ingelogde gebruiker toe, later kun je dit beperken tot 'admin' rol.
CREATE POLICY "Admins can update their club" 
ON clubs FOR UPDATE 
USING (auth.role() = 'authenticated');

-- 3. STORAGE POLICIES (Voor Uploads)
-- Zorg dat er een bucket 'club-assets' is (of gebruik de default 'images')
INSERT INTO storage.buckets (id, name, public) 
VALUES ('club-assets', 'club-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Iedereen mag plaatjes bekijken
DROP POLICY IF EXISTS "Public View" ON storage.objects;
CREATE POLICY "Public View"
ON storage.objects FOR SELECT
USING ( bucket_id = 'club-assets' );

-- Policy: Ingelogde mensen mogen uploaden
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'club-assets' AND auth.role() = 'authenticated' );

-- Policy: Ingelogde mensen mogen updaten/verwijderen
DROP POLICY IF EXISTS "Authenticated Update" ON storage.objects;
CREATE POLICY "Authenticated Update"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'club-assets' AND auth.role() = 'authenticated' );
