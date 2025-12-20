-- Migration: Add cancellation fee system (with DROP first)

-- Drop old function first
DROP FUNCTION IF EXISTS cancel_booking(UUID, TEXT);

-- Add cancellation fee columns to bookings
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancellation_fee DECIMAL(10,2) DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancellation_policy VARCHAR(50) DEFAULT 'flexible';

-- Create NEW cancel_booking function with fee calculation
CREATE OR REPLACE FUNCTION cancel_booking(
    p_booking_id UUID,
    p_reason TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_booking RECORD;
    v_hours_until_booking INTEGER;
    v_cancellation_fee DECIMAL(10,2);
    v_refund_amount DECIMAL(10,2);
    v_policy VARCHAR(50);
BEGIN
    -- Get booking details
    SELECT * INTO v_booking FROM bookings WHERE id = p_booking_id;
    
    IF v_booking IS NULL THEN
        RAISE EXCEPTION 'Booking not found';
    END IF;
    
    IF v_booking.cancelled_at IS NOT NULL THEN
        RAISE EXCEPTION 'Booking already cancelled';
    END IF;
    
    -- Calculate hours until booking
    v_hours_until_booking := EXTRACT(EPOCH FROM (
        (v_booking.booking_date::timestamp + v_booking.start_time::time) - NOW()
    )) / 3600;
    
    -- Determine cancellation policy and fee
    v_policy := COALESCE(v_booking.cancellation_policy, 'flexible');
    
    CASE v_policy
        WHEN 'flexible' THEN
            IF v_hours_until_booking >= 24 THEN
                v_cancellation_fee := 0;
                v_refund_amount := v_booking.total_price;
            ELSE
                v_cancellation_fee := v_booking.total_price * 0.5;
                v_refund_amount := v_booking.total_price * 0.5;
            END IF;
        WHEN 'moderate' THEN
            IF v_hours_until_booking >= 48 THEN
                v_cancellation_fee := 0;
                v_refund_amount := v_booking.total_price;
            ELSIF v_hours_until_booking >= 24 THEN
                v_cancellation_fee := v_booking.total_price * 0.5;
                v_refund_amount := v_booking.total_price * 0.5;
            ELSE
                v_cancellation_fee := v_booking.total_price;
                v_refund_amount := 0;
            END IF;
        WHEN 'strict' THEN
            IF v_hours_until_booking >= 48 THEN
                v_cancellation_fee := v_booking.total_price * 0.5;
                v_refund_amount := v_booking.total_price * 0.5;
            ELSE
                v_cancellation_fee := v_booking.total_price;
                v_refund_amount := 0;
            END IF;
        ELSE
            v_cancellation_fee := 0;
            v_refund_amount := v_booking.total_price;
    END CASE;
    
    -- Update booking with cancellation info
    UPDATE bookings 
    SET cancelled_at = NOW(),
        cancellation_reason = p_reason,
        cancellation_fee = v_cancellation_fee,
        refund_amount = v_refund_amount
    WHERE id = p_booking_id;
    
    -- Return summary
    RETURN jsonb_build_object(
        'success', true,
        'booking_id', p_booking_id,
        'original_price', v_booking.total_price,
        'cancellation_fee', v_cancellation_fee,
        'refund_amount', v_refund_amount,
        'hours_until_booking', v_hours_until_booking,
        'policy', v_policy
    );
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION cancel_booking TO authenticated;

-- Add comments
COMMENT ON FUNCTION cancel_booking IS 'Cancel a booking with automatic fee calculation based on cancellation policy';
COMMENT ON COLUMN bookings.cancellation_fee IS 'Fee charged for cancelling (based on policy and timing)';
COMMENT ON COLUMN bookings.refund_amount IS 'Amount refunded to user after cancellation';
COMMENT ON COLUMN bookings.cancellation_policy IS 'flexible, moderate, or strict';

-- Verify
SELECT 
    column_name, 
    data_type,
    column_default
FROM information_schema.columns 
WHERE table_name = 'bookings' 
AND column_name IN ('cancellation_fee', 'refund_amount', 'cancellation_policy');
