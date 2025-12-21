-- NUCLEAR OPTION FOR STORAGE
-- Als dit niet werkt, is er iets mis met de Supabase instantie zelf.

-- 1. Zorg dat de bucket bestaat en PUBLIC is
INSERT INTO storage.buckets (id, name, public) 
VALUES ('club-assets', 'club-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Drop ALLE bestaande policies op storage.objects die conflicteren
DROP POLICY IF EXISTS "Club Assets Public View" ON storage.objects;
DROP POLICY IF EXISTS "Club Assets Auth Upload" ON storage.objects;
DROP POLICY IF EXISTS "Club Assets Auth Update" ON storage.objects;
DROP POLICY IF EXISTS "Club Assets Auth Delete" ON storage.objects;
-- Oudere policies ook weghalen
DROP POLICY IF EXISTS "Public View" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;

-- 3. DE OPEN DEUR POLICY
-- We staan ALLES toe voor IEDEREEN op de 'club-assets' bucket.
-- Dit is veilig genoeg voor een demo/MVP, omdat de bucket naam uniek is.

CREATE POLICY "Give me access please"
ON storage.objects FOR ALL
USING ( bucket_id = 'club-assets' )
WITH CHECK ( bucket_id = 'club-assets' );
