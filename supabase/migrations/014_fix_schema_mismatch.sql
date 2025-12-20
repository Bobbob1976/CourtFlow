-- FIX SCHEMA MISMATCH
-- The database has 'price_per_hour' but the code expects 'hourly_rate'.
-- This script renames the column to match the codebase.

DO $$
BEGIN
    -- Check if 'price_per_hour' exists and 'hourly_rate' does not
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'courts' AND column_name = 'price_per_hour'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'courts' AND column_name = 'hourly_rate'
    ) THEN
        ALTER TABLE courts RENAME COLUMN price_per_hour TO hourly_rate;
    END IF;
END$$;

-- Reload schema cache is automatically handled by Supabase usually, 
-- but good to remind user to do it if issues persist.
