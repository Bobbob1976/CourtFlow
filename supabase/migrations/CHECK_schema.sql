-- Check current schema of courts and bookings tables

-- Courts table
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'courts'
ORDER BY ordinal_position;

-- Bookings table  
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'bookings'
ORDER BY ordinal_position;
