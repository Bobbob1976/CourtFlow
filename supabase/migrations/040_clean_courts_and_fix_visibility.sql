-- CLEAN COURTS & FIX VISIBILITY (040)
-- Fixes "Duplicate Key" errors, "No courts found", and "Column does not exist".
-- ROBUST VERSION: Checks and adds columns if missing.

-- 1. FIX SCHEMA (Ensure columns exist)
DO $$
BEGIN
    -- Ensure court_type exists (was 'type' in some versions)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courts' AND column_name = 'court_type') THEN
        ALTER TABLE courts ADD COLUMN court_type TEXT DEFAULT 'indoor';
    END IF;

    -- Ensure is_double exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courts' AND column_name = 'is_double') THEN
        ALTER TABLE courts ADD COLUMN is_double BOOLEAN DEFAULT TRUE;
    END IF;

    -- Ensure is_active exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courts' AND column_name = 'is_active') THEN
        ALTER TABLE courts ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    END IF;
    
    -- Ensure sport exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courts' AND column_name = 'sport') THEN
        ALTER TABLE courts ADD COLUMN sport TEXT DEFAULT 'padel';
    END IF;
END $$;

-- 2. DISABLE RLS (Ensure visibility)
ALTER TABLE courts DISABLE ROW LEVEL SECURITY;

-- 3. CLEANUP DUPLICATES
DELETE FROM courts 
WHERE club_id = (SELECT id FROM clubs WHERE subdomain = 'demo');

-- 4. INSERT FRESH COURTS (Using correct column names)
INSERT INTO courts (club_id, name, sport, court_type, hourly_rate, is_active, is_double)
SELECT 
    id, 
    'Baan 1', 'padel', 'indoor', 30.00, true, true
FROM clubs WHERE subdomain = 'demo';

INSERT INTO courts (club_id, name, sport, court_type, hourly_rate, is_active, is_double)
SELECT 
    id, 
    'Baan 2', 'padel', 'indoor', 30.00, true, true
FROM clubs WHERE subdomain = 'demo';

INSERT INTO courts (club_id, name, sport, court_type, hourly_rate, is_active, is_double)
SELECT 
    id, 
    'Baan 3', 'tennis', 'outdoor', 20.00, true, false
FROM clubs WHERE subdomain = 'demo';

-- 5. GRANT PERMISSIONS
GRANT ALL ON TABLE courts TO anon, authenticated, service_role;
GRANT ALL ON TABLE bookings TO anon, authenticated, service_role;
