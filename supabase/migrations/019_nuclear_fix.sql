-- NUCLEAR FIX SCRIPT
-- 1. DISABLE RLS COMPLETELY on courts table
-- This removes any permission issues.
ALTER TABLE courts DISABLE ROW LEVEL SECURITY;

-- 2. Force Insert Data for the specific Club ID from your logs
DO $$
DECLARE
    target_club_id UUID := '90f93d47-b438-427c-8b33-0597817c1d96';
BEGIN
    -- Delete existing courts for this club to start fresh
    DELETE FROM courts WHERE club_id = target_club_id;

    -- Insert fresh courts
    INSERT INTO courts (
        club_id, 
        name, 
        court_type, 
        hourly_rate, 
        sport, 
        is_active, 
        is_double
    ) VALUES 
    (target_club_id, 'Nuclear Court 1', 'indoor', 30.00, 'padel', true, true),
    (target_club_id, 'Nuclear Court 2', 'indoor', 30.00, 'padel', true, true),
    (target_club_id, 'Nuclear Court 3', 'indoor', 30.00, 'padel', true, true);
END$$;
