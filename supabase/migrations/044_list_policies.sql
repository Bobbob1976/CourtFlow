-- Step 1: First run this to see which policies exist
-- Copy the output and we'll create a targeted migration

SELECT 
    schemaname,
    tablename,
    policyname,
    cmd as command,
    qual as using_expression
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
