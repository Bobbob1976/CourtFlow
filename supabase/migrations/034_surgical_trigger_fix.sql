-- SURGICAL TRIGGER FIX (034)
-- Resolves "System Trigger" permission error AND "TRY_CAST" syntax error.
-- We drop ONLY the specific trigger causing issues, not ALL triggers.

-- 1. Kill the specific trigger causing issues
DROP TRIGGER IF EXISTS booking_time_range_trigger ON bookings;
DROP FUNCTION IF EXISTS update_booking_time_range;
DROP FUNCTION IF EXISTS create_atomic_booking;

-- 2. Fix Schema
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'booking_date') THEN
        ALTER TABLE bookings ADD COLUMN booking_date DATE;
    END IF;
END $$;

-- 3. Fix Data (Use standard SQL, no TRY_CAST)
UPDATE bookings SET booking_date = CURRENT_DATE WHERE booking_date IS NULL;
ALTER TABLE bookings ALTER COLUMN booking_date SET NOT NULL;

-- 4. Fix Time Columns
ALTER TABLE bookings ALTER COLUMN start_time TYPE TIME USING start_time::time;
ALTER TABLE bookings ALTER COLUMN end_time TYPE TIME USING end_time::time;

-- 5. Reset time_range column to be safe
ALTER TABLE bookings DROP COLUMN IF EXISTS time_range;
ALTER TABLE bookings ADD COLUMN time_range tstzrange;

-- 6. Recreate Trigger Function (Robust String Concat)
CREATE OR REPLACE FUNCTION update_booking_time_range()
RETURNS TRIGGER AS $$
BEGIN
    NEW.time_range = tstzrange(
        (NEW.booking_date::text || ' ' || NEW.start_time::text)::timestamptz,
        (NEW.booking_date::text || ' ' || NEW.end_time::text)::timestamptz,
        '[)'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Recreate Trigger
CREATE TRIGGER booking_time_range_trigger
    BEFORE INSERT OR UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_booking_time_range();

-- 8. Populate time_range for existing rows
UPDATE bookings SET time_range = tstzrange(
    (booking_date::text || ' ' || start_time::text)::timestamptz,
    (booking_date::text || ' ' || end_time::text)::timestamptz,
    '[)'
);

-- 9. Recreate Atomic Booking Function
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

GRANT EXECUTE ON FUNCTION create_atomic_booking TO anon, authenticated, service_role;
