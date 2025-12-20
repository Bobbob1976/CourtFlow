-- PHASE 2: Growth Features - Rain-Check System
-- Adds weather-related fields to bookings for automated rain checks.

-- Add new columns to the bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS weather_checked_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS weather_forecast JSONB;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS refund_status VARCHAR(20);

-- Add an index for bookings that need a weather check
CREATE INDEX IF NOT EXISTS idx_bookings_weather_check
ON bookings (booking_date, status)
WHERE status = 'confirmed' AND weather_checked_at IS NULL;

-- =============================================================================
-- RPC FUNCTION TO PROCESS RAIN CHECKS
-- This function would be called by a scheduled job (e.g., a cron job).
-- =============================================================================

CREATE OR REPLACE FUNCTION process_rain_checks(
    p_api_key TEXT,
    p_city_name TEXT -- Or lat/lon, depending on what the club provides
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    -- In a real implementation, you would fetch this from an external API.
    -- This is a placeholder for the logic.
    v_rain_is_forecasted BOOLEAN := true;
    v_booking RECORD;
    v_processed_count INTEGER := 0;
BEGIN
    -- Loop through upcoming, confirmed bookings that haven't been checked
    FOR v_booking IN
        SELECT * FROM bookings
        WHERE booking_date = CURRENT_DATE + INTERVAL '1 day'
        AND status = 'confirmed'
        AND weather_checked_at IS NULL
    LOOP
        -- Here, you would make an HTTP request to OpenWeatherMap
        -- For example:
        -- perform http_get('api.openweathermap.org/data/2.5/weather?q=' || p_city_name || '&appid=' || p_api_key)
        -- and parse the response to set v_rain_is_forecasted.

        -- For this example, we'll just assume it will rain.

        IF v_rain_is_forecasted THEN
            -- Credit the user's wallet
            -- In a real implementation, you'd call a function like `credit_wallet(user_id, club_id, amount, reason)`
            -- For now, we'll just update the booking status.

            UPDATE bookings
            SET
                status = 'cancelled',
                cancellation_reason = 'rain_check',
                refund_status = 'credited',
                weather_checked_at = NOW(),
                weather_forecast = jsonb_build_object('forecast', 'rain')
            WHERE id = v_booking.id;

            v_processed_count := v_processed_count + 1;
        ELSE
            -- Mark as checked
            UPDATE bookings
            SET
                weather_checked_at = NOW(),
                weather_forecast = jsonb_build_object('forecast', 'clear')
            WHERE id = v_booking.id;
        END IF;
    END LOOP;

    RETURN json_build_object('success', true, 'processed_count', v_processed_count);
END;
$$;
