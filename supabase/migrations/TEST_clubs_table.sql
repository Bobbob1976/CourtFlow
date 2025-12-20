-- TEST: Check if clubs table exists and what columns it has

SELECT 
    table_name,
    column_name,
    data_type,
    column_default
FROM information_schema.columns
WHERE table_name = 'clubs'
ORDER BY ordinal_position;
