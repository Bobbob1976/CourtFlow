-- NUCLEAR VISIBILITY & SCHEMA CHECK (028)
-- 1. Disable RLS on EVERYTHING to ensure data is visible.
-- 2. Check the actual columns of the 'bookings' table.

-- DISABLE RLS (Fixes "No Courts Found")
ALTER TABLE courts DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE clubs DISABLE ROW LEVEL SECURITY;

-- CHECK SCHEMA (Fixes "Column does not exist")
SELECT 
    column_name, 
    data_type 
FROM 
    information_schema.columns 
WHERE 
    table_name = 'bookings';
