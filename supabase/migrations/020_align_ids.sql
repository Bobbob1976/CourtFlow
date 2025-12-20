-- ALIGN IDS SCRIPT
-- This script dynamically finds the 'demo' club ID and ensures courts are linked to IT.

DO $$
DECLARE
    v_club_id UUID;
BEGIN
    -- 1. Get the ACTUAL ID for 'demo' from the clubs table
    SELECT id INTO v_club_id FROM clubs WHERE subdomain = 'demo';
    
    -- Safety check: If no demo club exists, create it
    IF v_club_id IS NULL THEN
        INSERT INTO clubs (name, subdomain, brand_color, subscription_tier) 
        VALUES ('Demo Padel Club', 'demo', '#000000', 'premium') 
        RETURNING id INTO v_club_id;
    END IF;

    RAISE NOTICE 'Using Club ID: %', v_club_id;

    -- 2. WIPE ALL DATA to ensure no mismatches remain
    -- Delete bookings first (foreign key dependency)
    DELETE FROM bookings;
    -- Delete ALL courts (so we don't have zombie courts with wrong IDs)
    DELETE FROM courts;

    -- 3. Insert fresh courts linked to the CORRECT ID
    INSERT INTO courts (
        club_id, 
        name, 
        court_type, 
        hourly_rate, 
        sport, 
        is_active, 
        is_double
    ) VALUES 
    (v_club_id, 'Baan 1 (Aligned)', 'indoor', 30.00, 'padel', true, true),
    (v_club_id, 'Baan 2 (Aligned)', 'indoor', 30.00, 'padel', true, true),
    (v_club_id, 'Baan 3 (Aligned)', 'indoor', 30.00, 'padel', true, true);
    
    -- 4. Ensure RLS is disabled (to be absolutely sure)
    ALTER TABLE courts DISABLE ROW LEVEL SECURITY;

END$$;
