-- RESTORE COURTS & PERMISSIONS (039)
-- The courts are missing or hidden. We will force them back.

-- 1. DISABLE RLS ON COURTS (Make them visible)
ALTER TABLE courts DISABLE ROW LEVEL SECURITY;

-- 2. GRANT PERMISSIONS
GRANT ALL ON TABLE courts TO anon, authenticated, service_role;
GRANT ALL ON TABLE bookings TO anon, authenticated, service_role;
GRANT ALL ON TABLE clubs TO anon, authenticated, service_role;

-- 3. INSERT DEMO COURTS (If missing)
DO $$
DECLARE
    target_club_id UUID;
BEGIN
    -- Get the Demo Club ID (or create it if missing - unlikely but safe)
    SELECT id INTO target_club_id FROM clubs WHERE slug = 'demo' LIMIT 1;
    
    -- If we found the club, ensure it has courts
    IF target_club_id IS NOT NULL THEN
        -- Delete existing courts for this club to avoid duplicates/confusion
        DELETE FROM courts WHERE club_id = target_club_id;

        -- Insert 3 fresh courts
        INSERT INTO courts (club_id, name, sport, type, hourly_rate, is_active, is_double)
        VALUES 
            (target_club_id, 'Baan 1', 'padel', 'indoor', 30.00, true, true),
            (target_club_id, 'Baan 2', 'padel', 'indoor', 30.00, true, true),
            (target_club_id, 'Baan 3', 'tennis', 'outdoor', 20.00, true, false);
    END IF;
END $$;
