-- MASTER FIX SCRIPT (UPDATED)
-- Run this to fix the 'courts' table columns once and for all.

BEGIN;

-- 1. Fix 'sport' column
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courts' AND column_name = 'sport') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sport_type') THEN
            CREATE TYPE sport_type AS ENUM ('padel', 'tennis', 'squash');
        END IF;
        ALTER TABLE courts ADD COLUMN sport sport_type NOT NULL DEFAULT 'padel';
    END IF;
END$$;

-- 2. Fix 'hourly_rate' column (Renaming from price_per_hour if needed)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courts' AND column_name = 'price_per_hour') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courts' AND column_name = 'hourly_rate') THEN
        ALTER TABLE courts RENAME COLUMN price_per_hour TO hourly_rate;
    END IF;
END$$;

-- 3. Fix 'is_double' column
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courts' AND column_name = 'is_double') THEN
        ALTER TABLE courts ADD COLUMN is_double BOOLEAN DEFAULT true;
    END IF;
END$$;

-- 4. Fix 'is_active' column (CRITICAL FIX)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courts' AND column_name = 'is_active') THEN
        ALTER TABLE courts ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END$$;

COMMIT;
