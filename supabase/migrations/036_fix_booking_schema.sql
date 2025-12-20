-- Fix: Add max_players and cancel functionality (SIMPLE VERSION)

-- Add max_players to courts if it doesn't exist
ALTER TABLE courts ADD COLUMN IF NOT EXISTS max_players INTEGER DEFAULT 4;

-- Add max_players to bookings if it doesn't exist  
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS max_players INTEGER DEFAULT 4;

-- Add cancelled_at column for soft deletes
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- Function to cancel a booking (simplified - just sets cancelled_at)
CREATE OR REPLACE FUNCTION cancel_booking(
    p_booking_id UUID,
    p_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_booking RECORD;
BEGIN
    -- Get booking details
    SELECT * INTO v_booking FROM bookings WHERE id = p_booking_id;
    
    IF v_booking IS NULL THEN
        RAISE EXCEPTION 'Booking not found';
    END IF;
    
    IF v_booking.cancelled_at IS NOT NULL THEN
        RAISE EXCEPTION 'Booking already cancelled';
    END IF;
    
    -- Mark as cancelled (just set cancelled_at, don't change status)
    UPDATE bookings 
    SET cancelled_at = NOW(),
        cancellation_reason = p_reason
    WHERE id = p_booking_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION cancel_booking TO authenticated;

-- Verify
SELECT 
    column_name, 
    data_type,
    column_default
FROM information_schema.columns 
WHERE table_name = 'bookings' 
AND column_name IN ('max_players', 'cancelled_at', 'cancellation_reason')
ORDER BY column_name;
