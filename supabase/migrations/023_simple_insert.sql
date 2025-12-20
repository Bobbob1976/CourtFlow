-- SIMPLE INSERT SCRIPT (023)
-- No variables, no logic, just raw SQL to test basic writing.

INSERT INTO courts (
    club_id, 
    name, 
    court_type, 
    hourly_rate, 
    sport, 
    is_active, 
    is_double
) VALUES (
    '90f93d47-b438-427c-8b33-0597817c1d96', -- The ID we verified in your logs
    'SIMPLE RAW INSERT', 
    'indoor', 
    30.00, 
    'padel', 
    true, 
    true
);
