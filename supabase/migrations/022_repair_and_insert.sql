-- REPAIR AND INSERT SCRIPT (022)
-- This script fixes potential schema issues AND inserts data in one go.

-- 1. Ensure Columns Exist (Idempotent)
DO $$
BEGIN
    -- sport
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courts' AND column_name = 'sport') THEN
        ALTER TABLE courts ADD COLUMN sport text DEFAULT 'padel';
    END IF;
    -- is_active
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courts' AND column_name = 'is_active') THEN
        ALTER TABLE courts ADD COLUMN is_active boolean DEFAULT true;
    END IF;
    -- is_double
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courts' AND column_name = 'is_double') THEN
        ALTER TABLE courts ADD COLUMN is_double boolean DEFAULT true;
    END IF;
    -- deleted_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courts' AND column_name = 'deleted_at') THEN
        ALTER TABLE courts ADD COLUMN deleted_at timestamptz;
    END IF;
     -- hourly_rate (rename if needed, or add)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courts' AND column_name = 'hourly_rate') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courts' AND column_name = 'price_per_hour') THEN
            ALTER TABLE courts RENAME COLUMN price_per_hour TO hourly_rate;
        ELSE
            ALTER TABLE courts ADD COLUMN hourly_rate decimal(10,2) DEFAULT 30.00;
        END IF;
    END IF;
END$$;

-- 2. Disable RLS (Just to be safe)
ALTER TABLE courts DISABLE ROW LEVEL SECURITY;

-- 3. Insert Data
DO $$
DECLARE
    target_id UUID := '90f93d47-b438-427c-8b33-0597817c1d96';
BEGIN
    -- Ensure Club Exists
    INSERT INTO clubs (id, name, subdomain, brand_color, subscription_tier)
    VALUES (target_id, 'Demo Padel Club', 'demo', '#000000', 'premium')
    ON CONFLICT (id) DO UPDATE SET subdomain = 'demo';

    -- Wipe Courts for this club
    DELETE FROM courts WHERE club_id = target_id;

    -- Insert Courts
    INSERT INTO courts (club_id, name, court_type, hourly_rate, sport, is_active, is_double)
    VALUES 
    (target_id, 'Repair Court 1', 'indoor', 30.00, 'padel', true, true),
    (target_id, 'Repair Court 2', 'indoor', 30.00, 'padel', true, true),
    (target_id, 'Repair Court 3', 'indoor', 30.00, 'padel', true, true);
    
    RAISE NOTICE 'Repaired schema and inserted 3 courts for Club ID: %', target_id;
END$$;
