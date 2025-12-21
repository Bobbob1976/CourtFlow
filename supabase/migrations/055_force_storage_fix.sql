-- FORCE FIX STORAGE POLICIES
-- We gaan er met de botte bijl doorheen om zeker te zijn dat het werkt.

-- 1. Zorg dat de bucket bestaat (voor de zekerheid)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('club-assets', 'club-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Verwijder ALLE policies op storage.objects die invloed kunnen hebben
DROP POLICY IF EXISTS "Public View" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete" ON storage.objects;
DROP POLICY IF EXISTS "Club Assets Public View" ON storage.objects;
DROP POLICY IF EXISTS "Club Assets Auth Upload" ON storage.objects;
DROP POLICY IF EXISTS "Give me access please" ON storage.objects;

-- 3. Maak NIEUWE, SIMPELE policies specifiek voor deze bucket

-- Iedereen mag kijken (zodat je banner zichtbaar is op de site)
CREATE POLICY "Club Assets Public View"
ON storage.objects FOR SELECT
USING ( bucket_id = 'club-assets' );

-- Ingelogde gebruikers mogen UPLOADEN (INSERT)
CREATE POLICY "Club Assets Auth Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'club-assets' AND auth.role() = 'authenticated' );

-- Ingelogde gebruikers mogen UPDATEN (overschrijven)
CREATE POLICY "Club Assets Auth Update"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'club-assets' AND auth.role() = 'authenticated' );

-- Ingelogde gebruikers mogen VERWIJDEREN
CREATE POLICY "Club Assets Auth Delete"
ON storage.objects FOR DELETE
USING ( bucket_id = 'club-assets' AND auth.role() = 'authenticated' );
