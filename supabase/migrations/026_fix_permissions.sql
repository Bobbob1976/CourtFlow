-- PERMISSION FIX SCRIPT (026)
-- The SQL Editor (Admin) sees data, but the App (Anon/Auth) does not.
-- This script explicitly GRANTS permissions to the web users.

-- 1. Grant Usage on Schema
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- 2. Grant Table Permissions (Crucial step often missed)
GRANT ALL ON TABLE courts TO anon, authenticated, service_role;
GRANT ALL ON TABLE clubs TO anon, authenticated, service_role;
GRANT ALL ON TABLE bookings TO anon, authenticated, service_role;

-- 3. Reset RLS to a known "Open" state
ALTER TABLE courts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public access" ON courts;
DROP POLICY IF EXISTS "Allow all" ON courts;

-- Create a wide-open policy
CREATE POLICY "Allow all"
ON courts
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- 4. Verify insertion again
INSERT INTO courts (
    club_id, 
    name, 
    court_type, 
    hourly_rate, 
    sport, 
    is_active, 
    is_double
) VALUES (
    '90f93d47-b438-427c-8b33-0597817c1d96', 
    'PERMISSION TEST COURT', 
    'indoor', 
    30.00, 
    'padel', 
    true, 
    true
);
