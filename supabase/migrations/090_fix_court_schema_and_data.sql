-- 1. SCHEMAS FIXEN: Voeg ontbrekende kolommen toe aan 'courts'
ALTER TABLE public.courts 
ADD COLUMN IF NOT EXISTS surface text DEFAULT 'padel',
ADD COLUMN IF NOT EXISTS is_indoor boolean DEFAULT true;

-- 2. DATA FIXEN: Koppel banen aan de club
DO $$
DECLARE
    real_club_id uuid;
    courts_count integer;
BEGIN
    -- Zoek een geldige club ID
    SELECT id INTO real_club_id FROM public.clubs LIMIT 1;

    -- Als er geen club is, maak er eentje
    IF real_club_id IS NULL THEN
        INSERT INTO public.clubs (name, city, country, address)
        VALUES ('Mijn Padel Club', 'Amsterdam', 'NL', 'Hoofdstraat 1')
        RETURNING id INTO real_club_id;
    END IF;

    RAISE NOTICE 'Fixing courts for Club ID: %', real_club_id;

    -- Koppel alle zwevende banen aan deze club
    UPDATE public.courts 
    SET club_id = real_club_id 
    WHERE club_id IS NULL;

    -- Tel hoeveel banen we nu hebben
    SELECT count(*) INTO courts_count FROM public.courts WHERE club_id = real_club_id;

    -- Als er nog steeds 0 banen zijn, maak ze aan
    IF courts_count = 0 THEN
        INSERT INTO public.courts (name, club_id, surface, is_indoor) VALUES
        ('Court 1', real_club_id, 'padel', true),
        ('Court 2', real_club_id, 'padel', true),
        ('Central Court', real_club_id, 'padel', true);
    END IF;
END $$;

-- 3. STORAGE FIXEN (Voor de zekerheid)
UPDATE storage.buckets SET public = true WHERE id = 'club-images';
