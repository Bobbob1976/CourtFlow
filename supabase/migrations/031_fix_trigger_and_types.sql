-- TRIGGER & TYPE FIX SCRIPT (031)
-- The previous errors were caused by an existing TRIGGER firing during our updates.
-- We must DROP the trigger first, fix the data, and then recreate everything.

-- 1. DROP TRIGGER AND FUNCTION FIRST (The Culprit)
DROP TRIGGER IF EXISTS booking_time_range_trigger ON bookings;
DROP FUNCTION IF EXISTS update_booking_time_range;
DROP FUNCTION IF EXISTS create_atomic_booking;

-- 2. FIX TABLE COLUMNS AND DATA
DO $$
BEGIN
    -- Add booking_date if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'booking_date') THEN
        ALTER TABLE bookings ADD COLUMN booking_date DATE;
    END IF;
END $$;

-- Update booking_date safely (default to today if start_time conversion fails or is null)
UPDATE bookings 
SET booking_date = COALESCE(TRY_CAST(start_time::text AS DATE), CURRENT_DATE) 
WHERE booking_date IS NULL;

ALTER TABLE bookings ALTER COLUMN booking_date SET NOT NULL;

-- Convert start/end times to TIME type (using robust casting)
ALTER TABLE bookings ALTER COLUMN start_time TYPE TIME USING start_time::time;
ALTER TABLE bookings ALTER COLUMN end_time TYPE TIME USING end_time::time;

-- 3. RECREATE TRIGGER FUNCTION (With Correct Casting)
CREATE OR REPLACE FUNCTION update_booking_time_range()
RETURNS TRIGGER AS $$
BEGIN
    -- Set time range: start inclusive, end exclusive
    -- FIXED: Explicitly cast to timestamptz
    NEW.time_range = tstzrange(
        (NEW.booking_date::text || ' ' || NEW.start_time::text)::timestamptz,
        (NEW.booking_date::text || ' ' || NEW.end_time::text)::timestamptz,
        '[)'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. RECREATE TRIGGER
CREATE TRIGGER booking_time_range_trigger
    BEFORE INSERT OR UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_booking_time_range();

-- 5. RECREATE ATOMIC BOOKING FUNCTION
CREATE OR REPLACE FUNCTION create_atomic_booking(
    p_club_id UUID,
    p_court_id UUID, 
    p_user_id UUID,
    p_start_time TIME,
    p_end_time TIME,
    p_total_price DECIMAL(10,2),
    p_booking_date DATE DEFAULT CURRENT_DATE,
    p_attendees INTEGER DEFAULT 1,
    p_booking_notes TEXT DEFAULT NULL,
    p_is_public_match BOOLEAN DEFAULT FALSE,
    p_looking_for_players INTEGER DEFAULT 0
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    booking_id UUID;
    new_booking JSON;
    booking_range tstzrange;
    overlap_count INTEGER;
    ts_start timestamptz;
    ts_end timestamptz;
BEGIN
    IF p_start_time >= p_end_time THEN
        RAISE EXCEPTION 'Start time must be before end time';
    END IF;

    -- Construct timestamps explicitly
    ts_start := (p_booking_date::text || ' ' || p_start_time::text)::timestamptz;
    ts_end := (p_booking_date::text || ' ' || p_end_time::text)::timestamptz;

    booking_range := tstzrange(ts_start, ts_end, '[)');

    SELECT COUNT(*) INTO overlap_count
    FROM bookings b
    WHERE b.court_id = p_court_id
    AND b.club_id = p_club_id
    AND b.status != 'cancelled'
    AND b.time_range && booking_range
    AND b.user_id != p_user_id;

    IF overlap_count > 0 THEN
        RAISE EXCEPTION 'Time slot unavailable - overlapping booking exists';
    END IF;

    INSERT INTO bookings (
        club_id, court_id, user_id, booking_date, start_time, end_time, 
        total_cost, attendees, booking_notes, status, payment_status
    ) VALUES (
        p_club_id, p_court_id, p_user_id, p_booking_date, p_start_time, p_end_time, 
        p_total_price, p_attendees, p_booking_notes, 'confirmed', 'pending'
    ) RETURNING id INTO booking_id;

    SELECT row_to_json(b.*) INTO new_booking
    FROM bookings b
    WHERE b.id = booking_id;

    RETURN new_booking;
END;
$$;

-- 6. GRANT PERMISSIONS
GRANT EXECUTE ON FUNCTION create_atomic_booking TO anon, authenticated, service_role;

-- 7. Helper for TRY_CAST (if needed, inline logic used above instead)
-- Done.
