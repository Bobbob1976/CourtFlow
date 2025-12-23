DO $$
DECLARE
    real_club_id uuid;
    courts_count integer;
BEGIN
    -- 1. Zoek het ECHTE club ID (pak de eerste die we vinden)
    SELECT id INTO real_club_id FROM public.clubs LIMIT 1;

    -- Als er GEEN club is, maak er dan een aan
    IF real_club_id IS NULL THEN
        INSERT INTO public.clubs (name, city, country, address)
        VALUES ('Mijn Padel Club', 'Amsterdam', 'NL', 'Hoofdstraat 1')
        RETURNING id INTO real_club_id;
    END IF;

    RAISE NOTICE 'Using Club ID: %', real_club_id;

    -- 2. Koppel zwevende banen aan dit ID
    UPDATE public.courts 
    SET club_id = real_club_id 
    WHERE club_id IS NULL 
       OR club_id NOT IN (SELECT id FROM public.clubs);

    -- 3. Check of we nu banen hebben
    SELECT count(*) INTO courts_count FROM public.courts WHERE club_id = real_club_id;

    -- 4. Zo niet, maak nieuwe banen aan
    IF courts_count = 0 THEN
        INSERT INTO public.courts (name, club_id, surface, is_indoor) VALUES
        ('Court 1', real_club_id, 'padel', true),
        ('Court 2', real_club_id, 'padel', true),
        ('Central Court', real_club_id, 'padel', true);
    END IF;
END $$;

-- FIX STORAGE (Nogmaals voor de zekerheid)
UPDATE storage.buckets SET public = true WHERE id = 'club-images';

DROP POLICY IF EXISTS "Public Images Read 3" ON storage.objects;
CREATE POLICY "Public Images Read 3" ON storage.objects
FOR SELECT USING ( bucket_id = 'club-images' );

DROP POLICY IF EXISTS "Auth Images Upload 3" ON storage.objects;
CREATE POLICY "Auth Images Upload 3" ON storage.objects
FOR INSERT WITH CHECK ( bucket_id = 'club-images' AND auth.role() = 'authenticated' );
