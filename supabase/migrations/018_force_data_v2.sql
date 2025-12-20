-- FORCE DATA SCRIPT V2
-- Run this to force-create courts for the SPECIFIC Club ID found in logs.

DO $$
DECLARE
    -- This is the ID from your logs: 90f93d47-b438-427c-8b33-0597817c1d96
    target_club_id UUID := '90f93d47-b438-427c-8b33-0597817c1d96';
BEGIN
    -- 1. Clean up dependent data (Bookings) to allow deleting courts
    -- We delete bookings for any court belonging to this club
    DELETE FROM bookings 
    WHERE court_id IN (SELECT id FROM courts WHERE club_id = target_club_id);

    -- 2. Delete existing courts for this club
    DELETE FROM courts WHERE club_id = target_club_id;

    -- 3. Insert 3 Fresh Courts
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
    (target_club_id, 'Baan 1 (V2)', 'indoor', 30.00, 'padel', true, true, NULL),
    (target_club_id, 'Baan 2 (V2)', 'indoor', 30.00, 'padel', true, true, NULL),
    (target_club_id, 'Baan 3 (V2)', 'indoor', 30.00, 'padel', true, true, NULL);

    -- 4. Ensure RLS is wide open
    DROP POLICY IF EXISTS "Public view courts" ON courts;
    CREATE POLICY "Public view courts" ON courts FOR SELECT USING (true);

END$$;
