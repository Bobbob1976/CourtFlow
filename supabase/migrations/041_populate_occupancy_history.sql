-- Populate court_occupancy_history from existing bookings
-- This creates historical data for ML training and forecasting

-- Insert historical occupancy data from bookings
INSERT INTO court_occupancy_history (
    club_id,
    court_id,
    date,
    hour,
    day_of_week,
    occupancy_rate,
    total_bookings,
    total_revenue,
    weather_condition,
    temperature
)
SELECT 
    b.club_id,
    b.court_id,
    b.booking_date as date,
    EXTRACT(HOUR FROM b.start_time)::INTEGER as hour,
    EXTRACT(DOW FROM b.booking_date)::INTEGER as day_of_week,
    -- Calculate occupancy rate (simplified: 100% if booked, 0% if not)
    100.0 as occupancy_rate,
    COUNT(*) as total_bookings,
    SUM(b.total_cost) as total_revenue,
    -- Weather data (null for now - will be filled by weather API)
    NULL as weather_condition,
    NULL as temperature
FROM bookings b
WHERE b.cancelled_at IS NULL
  AND b.booking_date >= CURRENT_DATE - INTERVAL '90 days' -- Last 3 months
GROUP BY 
    b.club_id,
    b.court_id,
    b.booking_date,
    EXTRACT(HOUR FROM b.start_time),
    EXTRACT(DOW FROM b.booking_date)
ON CONFLICT (club_id, court_id, date, hour) 
DO UPDATE SET
    total_bookings = EXCLUDED.total_bookings,
    total_revenue = EXCLUDED.total_revenue,
    occupancy_rate = EXCLUDED.occupancy_rate;

-- Verify the data
SELECT 
    club_id,
    COUNT(*) as total_records,
    MIN(date) as earliest_date,
    MAX(date) as latest_date,
    AVG(occupancy_rate) as avg_occupancy,
    SUM(total_revenue) as total_revenue
FROM court_occupancy_history
GROUP BY club_id;

COMMENT ON TABLE court_occupancy_history IS 'Historical occupancy data populated from bookings for ML forecasting';
