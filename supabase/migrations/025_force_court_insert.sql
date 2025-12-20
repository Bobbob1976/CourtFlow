-- FORCE INSERT WITH FEEDBACK (025)
-- This script disables RLS and inserts a court, RETURNING the result so you can see it.

-- 1. Ensure RLS is OFF (Nuclear option)
ALTER TABLE courts DISABLE ROW LEVEL SECURITY;

-- 2. Insert and RETURN the result
INSERT INTO courts (
    club_id, 
    name, 
    court_type, 
    hourly_rate, 
    sport, 
    is_active, 
    is_double
) VALUES (
    '90f93d47-b438-427c-8b33-0597817c1d96', -- The ID we verified
    'SQL FORCE INSERT 025', 
    'indoor', 
    30.00, 
    'padel', 
    true, 
    true
)
RETURNING *;
