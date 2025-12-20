-- FORCE DATA SCRIPT
-- Run this to force-create courts for the 'demo' club.

-- 1. Ensure extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Ensure types
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sport_type') THEN
        CREATE TYPE sport_type AS ENUM ('padel', 'tennis', 'squash');
    END IF;
END$$;

-- 3. The Meat
DO $$
DECLARE
    target_club_id UUID;
BEGIN
    -- Get the club ID for 'demo'
    SELECT id INTO target_club_id FROM clubs WHERE subdomain = 'demo';

    -- If no demo club, create it
    IF target_club_id IS NULL THEN
        INSERT INTO clubs (name, subdomain, brand_color, subscription_tier)
        VALUES ('Demo Padel Club', 'demo', '#000000', 'premium')
        RETURNING id INTO target_club_id;
    END IF;

    -- Delete existing courts for this club (start fresh to avoid duplicates/confusion)
    DELETE FROM courts WHERE club_id = target_club_id;

    -- Insert 3 fresh courts with ALL required fields
    INSERT INTO courts (
        club_id,
        name,
        court_type,
        hourly_rate,
        sport,
        is_active,
        is_double,
        deleted_at
    ) VALUES
    (target_club_id, 'Baan 1 (Force)', 'indoor', 30.00, 'padel', true, true, NULL),
    (target_club_id, 'Baan 2 (Force)', 'indoor', 30.00, 'padel', true, true, NULL),
    (target_club_id, 'Baan 3 (Force)', 'indoor', 30.00, 'padel', true, true, NULL);

    -- Fix RLS to be WIDE OPEN (for debugging)
    DROP POLICY IF EXISTS "Public view courts" ON courts;
    DROP POLICY IF EXISTS "Users can view accessible courts" ON courts;
    CREATE POLICY "Public view courts" ON courts FOR SELECT USING (true);

END$$;
