-- FINAL ATTEMPT STORAGE FIX
-- We gaan de fundamentele rechten (GRANTS) herstellen en policies versimpelen.

-- 1. Geef expliciete permissies aan de 'authenticated' en 'anon' rollen op de storage schema tabellen
GRANT USAGE ON SCHEMA storage TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA storage TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA storage TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA storage TO postgres, anon, authenticated, service_role;

-- 2. Zorg dat de bucket bestaat
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES ('club-assets', 'club-assets', true, 5242880, '{image/*}') -- 5MB limit, images only
ON CONFLICT (id) DO UPDATE SET public = true;

-- 3. Verwijder OUDE policies (grote schoonmaak)
DROP POLICY IF EXISTS "Public View" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "Club Assets Public View" ON storage.objects;
DROP POLICY IF EXISTS "Club Assets Auth Upload" ON storage.objects;
DROP POLICY IF EXISTS "Club Assets Auth Update" ON storage.objects;
DROP POLICY IF EXISTS "Club Assets Auth Delete" ON storage.objects;
DROP POLICY IF EXISTS "Give me access please" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload club-assets" ON storage.objects;

-- 4. MAAK NIEUWE POLICIES (Simpel en Krachtig)

-- INSERT (Uploaden): Iedereen (ook anoniem voor de zekerheid) mag uploaden naar club-assets
CREATE POLICY "Anyone can upload club-assets"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'club-assets' );

-- UPDATE: Iedereen mag overschrijven in club-assets
CREATE POLICY "Anyone can update club-assets"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'club-assets' );

-- SELECT: Iedereen mag kijken
CREATE POLICY "Anyone can view club-assets"
ON storage.objects FOR SELECT
USING ( bucket_id = 'club-assets' );

-- DELETE: Iedereen mag wissen (pas op, maar handig voor demo)
CREATE POLICY "Anyone can delete club-assets"
ON storage.objects FOR DELETE
USING ( bucket_id = 'club-assets' );

-- 5. OOK POLICIES VOOR BUCKETS (Soms faalt de client hierop)
DROP POLICY IF EXISTS "View Buckets" ON storage.buckets;
CREATE POLICY "View Buckets"
ON storage.buckets FOR SELECT
USING ( true );
