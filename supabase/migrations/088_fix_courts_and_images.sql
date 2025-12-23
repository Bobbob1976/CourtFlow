-- FIX 1: COURTS (BANEN)
-- We koppelen bestaande banen aan jouw specifieke Club ID uit de screenshot: 'fc83555e-38d7-4b3b-a6f2-4087ccf5f641'
-- Of we maken nieuwe aan als er geen zijn.

DO $$
DECLARE
    target_club_id uuid := 'fc83555e-38d7-4b3b-a6f2-4087ccf5f641';
    courts_count integer;
BEGIN
    -- Check hoeveel banen deze club heeft
    SELECT count(*) INTO courts_count FROM public.courts WHERE club_id = target_club_id;
    
    -- Als 0, probeer "zwevende" of "demo" banen te stelen
    IF courts_count = 0 THEN
        UPDATE public.courts 
        SET club_id = target_club_id 
        WHERE club_id IS NULL OR club_id != target_club_id;
        
        -- Check opnieuw
        SELECT count(*) INTO courts_count FROM public.courts WHERE club_id = target_club_id;
        
        -- Als NOG STEEDS 0, maak dan nieuwe aan
        IF courts_count = 0 THEN
            INSERT INTO public.courts (name, club_id, surface, is_indoor) VALUES
            ('Court 1', target_club_id, 'padel', true),
            ('Court 2', target_club_id, 'padel', true),
            ('Central Court', target_club_id, 'padel', true);
        END IF;
    END IF;
END $$;


-- FIX 2: STORAGE IMAGES (BROKEN THUMBNAILS)
-- We forceren de bucket naar PUBLIC en verwijderen restrictieve policies

-- 1. Update bucket config
UPDATE storage.buckets
SET public = true
WHERE id = 'club-images';

-- 2. Maak policy voor iedereen om te LEZEN (SELECT)
DROP POLICY IF EXISTS "Public Images Read 2" ON storage.objects;
CREATE POLICY "Public Images Read 2" ON storage.objects
FOR SELECT
USING ( bucket_id = 'club-images' );

-- 3. Zorg dat geauthenticeerde users kunnen uploaden
DROP POLICY IF EXISTS "Auth Images Upload 2" ON storage.objects;
CREATE POLICY "Auth Images Upload 2" ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'club-images' 
  AND auth.role() = 'authenticated'
);
