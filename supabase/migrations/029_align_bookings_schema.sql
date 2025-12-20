-- ALIGN BOOKINGS SCHEMA (029) - ROBUST VERSION
-- The database schema has drifted (using timestamptz instead of date+time).
-- This script aligns it back to what the App expects.

-- 1. Add booking_date column if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'booking_date') THEN
        ALTER TABLE bookings ADD COLUMN booking_date DATE;
    END IF;
END $$;

-- 2. Populate booking_date from start_time (assuming start_time holds the date)
UPDATE bookings SET booking_date = start_time::date WHERE booking_date IS NULL;

-- 3. Ensure booking_date is NOT NULL (after population)
ALTER TABLE bookings ALTER COLUMN booking_date SET NOT NULL;

-- 4. Convert start_time and end_time to TIME (if they are timestamps)
-- Note: We use USING to cast correctly.
ALTER TABLE bookings ALTER COLUMN start_time TYPE TIME USING start_time::time;
ALTER TABLE bookings ALTER COLUMN end_time TYPE TIME USING end_time::time;

-- 5. Drop the old function to avoid signature conflicts
DROP FUNCTION IF EXISTS create_atomic_booking;

-- 6. Re-create the Atomic Booking Function with the correct signature
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
BEGIN
    -- Input validation
    IF p_start_time >= p_end_time THEN
        RAISE EXCEPTION 'Start time must be before end time';
    END IF;

    -- Create time range for the new booking
    -- ROBUST FIX: Use string concatenation to force correct timestamp construction
    booking_range = tstzrange(
        (p_booking_date::text || ' ' || p_start_time::text)::timestamptz,
        (p_booking_date::text || ' ' || p_end_time::text)::timestamptz,
        '[)'
    );

    -- Check for overlapping bookings
    SELECT COUNT(*) INTO overlap_count
    FROM bookings b
    WHERE b.court_id = p_court_id
    AND b.club_id = p_club_id
    AND b.status != 'cancelled'
    AND b.time_range && booking_range
    AND b.user_id != p_user_id; -- Allow self-overlap (race condition handling)

    IF overlap_count > 0 THEN
        RAISE EXCEPTION 'Time slot unavailable - overlapping booking exists';
    END IF;

    -- Create the booking
    INSERT INTO bookings (
        club_id,
        court_id,
        user_id,
        booking_date,
        start_time,
        end_time,
        total_cost,
        attendees,
        booking_notes,
        status,
        payment_status
    ) VALUES (
        p_club_id,
        p_court_id,
        p_user_id,
        p_booking_date,
        p_start_time,
        p_end_time,
        p_total_price,
        p_attendees,
        p_booking_notes,
        'confirmed',
        'pending'
    ) RETURNING id INTO booking_id;

    -- Return the created booking
    SELECT row_to_json(b.*) INTO new_booking
    FROM bookings b
    WHERE b.id = booking_id;

    RETURN new_booking;
END;
$$;

-- 7. Grant execute permission
GRANT EXECUTE ON FUNCTION create_atomic_booking TO anon, authenticated, service_role;
