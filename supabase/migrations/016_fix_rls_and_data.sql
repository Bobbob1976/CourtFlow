-- FIX RLS AND DATA (UPDATED V3)

-- 0. Fix Constraints & Columns
DO $$
BEGIN
    -- Drop restrictive check constraint on subscription_tier if it exists
    -- This allows us to use 'premium' or other new tiers
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'clubs_subscription_tier_check') THEN
        ALTER TABLE clubs DROP CONSTRAINT clubs_subscription_tier_check;
    END IF;

    -- Ensure deleted_at column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courts' AND column_name = 'deleted_at') THEN
        ALTER TABLE courts ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
    END IF;
     IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clubs' AND column_name = 'deleted_at') THEN
        ALTER TABLE clubs ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
    END IF;
END$$;

-- 1. Allow public access to courts (so users can book)
DROP POLICY IF EXISTS "Users can view accessible courts" ON courts;
DROP POLICY IF EXISTS "Public view courts" ON courts;
CREATE POLICY "Public view courts" ON courts FOR SELECT USING (deleted_at IS NULL);

-- 2. Insert Demo Data (if not exists)
DO $$
DECLARE
    demo_club_id UUID;
BEGIN
    -- Get or Create Demo Club
    INSERT INTO clubs (name, subdomain, brand_color, subscription_tier)
    VALUES ('Demo Padel Club', 'demo', '#000000', 'premium')
    ON CONFLICT (subdomain) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO demo_club_id;

    -- Ensure we have the ID if it already existed
    IF demo_club_id IS NULL THEN
        SELECT id INTO demo_club_id FROM clubs WHERE subdomain = 'demo';
    END IF;

    -- Insert Courts if none exist for this club
    IF NOT EXISTS (SELECT 1 FROM courts WHERE club_id = demo_club_id) THEN
        INSERT INTO courts (club_id, name, court_type, hourly_rate, sport, is_active, is_double)
        VALUES 
        (demo_club_id, 'Baan 1', 'indoor', 30.00, 'padel', true, true),
        (demo_club_id, 'Baan 2', 'indoor', 30.00, 'padel', true, true),
        (demo_club_id, 'Baan 3', 'indoor', 30.00, 'padel', true, true);
    END IF;
END$$;
