-- DEBUG SCRIPT
-- Run this to see which columns actually exist in the 'courts' table

SELECT column_name, data_type, udt_name
FROM information_schema.columns 
WHERE table_name = 'courts';
