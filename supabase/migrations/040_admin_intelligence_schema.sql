-- Admin Intelligence & Forecasting System
-- Database schema for historical data tracking and predictions

-- 1. Historical Occupancy Data (for ML training)
CREATE TABLE IF NOT EXISTS court_occupancy_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    court_id UUID NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    hour INTEGER NOT NULL CHECK (hour >= 0 AND hour <= 23),
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 6=Saturday
    occupancy_rate DECIMAL(5,2) NOT NULL, -- 0.00 to 100.00
    total_bookings INTEGER DEFAULT 0,
    total_revenue DECIMAL(10,2) DEFAULT 0,
    weather_condition VARCHAR(50), -- 'sunny', 'rainy', 'cloudy', etc.
    temperature DECIMAL(5,2), -- in Celsius
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(club_id, court_id, date, hour)
);

-- 2. Weather Data Cache (to avoid excessive API calls)
CREATE TABLE IF NOT EXISTS weather_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location VARCHAR(255) NOT NULL, -- City or coordinates
    date DATE NOT NULL,
    hour INTEGER NOT NULL CHECK (hour >= 0 AND hour <= 23),
    condition VARCHAR(50), -- 'sunny', 'rainy', 'cloudy', 'snowy'
    temperature DECIMAL(5,2),
    precipitation_chance INTEGER, -- 0-100%
    wind_speed DECIMAL(5,2),
    fetched_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(location, date, hour)
);

-- 3. Occupancy Predictions (cached forecasts)
CREATE TABLE IF NOT EXISTS occupancy_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    prediction_date DATE NOT NULL,
    hour INTEGER NOT NULL CHECK (hour >= 0 AND hour <= 23),
    predicted_occupancy DECIMAL(5,2) NOT NULL, -- 0.00 to 100.00
    confidence_level DECIMAL(5,2), -- 0.00 to 100.00
    factors JSONB, -- {"weather": "rainy", "day": "monday", "historical_avg": 75}
    recommended_staff INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(club_id, prediction_date, hour)
);

-- 4. Court Maintenance Log (for grid status)
CREATE TABLE IF NOT EXISTS court_maintenance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    court_id UUID NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL, -- 'maintenance', 'repair', 'cleaning'
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE court_occupancy_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE occupancy_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE court_maintenance ENABLE ROW LEVEL SECURITY;

-- Policies for court_occupancy_history
CREATE POLICY "Club admins can view occupancy history"
    ON court_occupancy_history FOR SELECT
    USING (true); -- Simplified for now

CREATE POLICY "System can insert occupancy history"
    ON court_occupancy_history FOR INSERT
    WITH CHECK (true);

-- Policies for weather_cache
CREATE POLICY "Anyone can view weather cache"
    ON weather_cache FOR SELECT
    USING (true);

CREATE POLICY "System can manage weather cache"
    ON weather_cache FOR ALL
    USING (true);

-- Policies for occupancy_predictions
CREATE POLICY "Club admins can view predictions"
    ON occupancy_predictions FOR SELECT
    USING (true);

CREATE POLICY "System can manage predictions"
    ON occupancy_predictions FOR ALL
    USING (true);

-- Policies for court_maintenance
CREATE POLICY "Authenticated users can view maintenance"
    ON court_maintenance FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage maintenance"
    ON court_maintenance FOR ALL
    USING (auth.role() = 'authenticated');

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_occupancy_history_club_date 
    ON court_occupancy_history(club_id, date);

CREATE INDEX IF NOT EXISTS idx_occupancy_history_day_hour 
    ON court_occupancy_history(day_of_week, hour);

CREATE INDEX IF NOT EXISTS idx_weather_cache_location_date 
    ON weather_cache(location, date);

CREATE INDEX IF NOT EXISTS idx_predictions_club_date 
    ON occupancy_predictions(club_id, prediction_date);

CREATE INDEX IF NOT EXISTS idx_maintenance_court_time 
    ON court_maintenance(court_id, start_time, end_time);

-- Grant permissions
GRANT ALL ON court_occupancy_history TO authenticated, service_role;
GRANT ALL ON weather_cache TO authenticated, service_role;
GRANT ALL ON occupancy_predictions TO authenticated, service_role;
GRANT ALL ON court_maintenance TO authenticated, service_role;

-- Function to calculate daily occupancy rate
CREATE OR REPLACE FUNCTION calculate_occupancy_rate(
    p_club_id UUID,
    p_date DATE
)
RETURNS TABLE (
    hour INTEGER,
    occupancy_rate DECIMAL(5,2),
    total_bookings INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        EXTRACT(HOUR FROM b.start_time)::INTEGER as hour,
        (COUNT(*)::DECIMAL / (SELECT COUNT(*) FROM courts WHERE club_id = p_club_id) * 100) as occupancy_rate,
        COUNT(*)::INTEGER as total_bookings
    FROM bookings b
    WHERE b.club_id = p_club_id
    AND b.booking_date = p_date
    AND b.cancelled_at IS NULL
    GROUP BY EXTRACT(HOUR FROM b.start_time)
    ORDER BY hour;
END;
$$ LANGUAGE plpgsql;

-- Function to get average occupancy for a specific day/hour
CREATE OR REPLACE FUNCTION get_historical_average(
    p_club_id UUID,
    p_day_of_week INTEGER,
    p_hour INTEGER
)
RETURNS DECIMAL(5,2) AS $$
DECLARE
    v_avg DECIMAL(5,2);
BEGIN
    SELECT AVG(occupancy_rate) INTO v_avg
    FROM court_occupancy_history
    WHERE club_id = p_club_id
    AND day_of_week = p_day_of_week
    AND hour = p_hour
    AND date >= CURRENT_DATE - INTERVAL '90 days'; -- Last 3 months
    
    RETURN COALESCE(v_avg, 0);
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE court_occupancy_history IS 'Historical occupancy data for ML training and forecasting';
COMMENT ON TABLE weather_cache IS 'Cached weather data to reduce API calls';
COMMENT ON TABLE occupancy_predictions IS 'AI-generated occupancy predictions';
COMMENT ON TABLE court_maintenance IS 'Court maintenance and repair tracking';
