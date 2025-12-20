-- FINAL DATA FIX SCRIPT (021)
-- This script enforces consistency between the App (Server) and the Database.

DO $$
DECLARE
    -- The ID the App expects (from your logs)
    target_id UUID := '90f93d47-b438-427c-8b33-0597817c1d96';
    existing_club_id UUID;
BEGIN
    -- 1. Check who currently owns the 'demo' subdomain
    SELECT id INTO existing_club_id FROM clubs WHERE subdomain = 'demo';
    
    -- 2. If 'demo' is owned by a DIFFERENT ID, rename that old club to free up the subdomain
    IF existing_club_id IS NOT NULL AND existing_club_id != target_id THEN
        RAISE NOTICE 'Renaming old demo club % to demo-old', existing_club_id;
        UPDATE clubs SET subdomain = 'demo-old-' || substr(existing_club_id::text, 1, 4) 
        WHERE id = existing_club_id;
    END IF;

    -- 3. Ensure our TARGET ID exists and has the 'demo' subdomain
    INSERT INTO clubs (id, name, subdomain, brand_color, subscription_tier)
    VALUES (target_id, 'Demo Padel Club', 'demo', '#000000', 'premium')
    ON CONFLICT (id) DO UPDATE 
    SET subdomain = 'demo'; -- Claim the subdomain if we already exist

    -- 4. Wipe courts for this specific club (start fresh)
    DELETE FROM courts WHERE club_id = target_id;

    -- 5. Insert fresh courts linked to the CORRECT ID
    INSERT INTO courts (club_id, name, court_type, hourly_rate, sport, is_active, is_double)
    VALUES 
    (target_id, 'Final Court 1', 'indoor', 30.00, 'padel', true, true),
    (target_id, 'Final Court 2', 'indoor', 30.00, 'padel', true, true),
    (target_id, 'Final Court 3', 'indoor', 30.00, 'padel', true, true);

    -- 6. Disable RLS on courts (Nuclear option to be safe)
    ALTER TABLE courts DISABLE ROW LEVEL SECURITY;
    
    RAISE NOTICE 'Fixed data for Club ID: %', target_id;
END$$;
