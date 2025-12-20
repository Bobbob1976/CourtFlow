-- ULTIMATE REBUILD SCRIPT (037)
-- The bookings table is corrupted. We are rebuilding it from scratch.
-- WARNING: This deletes all existing bookings.

-- 1. DROP EVERYTHING (Clean Slate)
DROP TABLE IF EXISTS match_players CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;

-- 2. RECREATE BOOKINGS TABLE
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    club_id UUID REFERENCES clubs(id),
    court_id UUID REFERENCES courts(id),
    user_id UUID REFERENCES auth.users(id),
    
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    time_range TSTZRANGE,
    
    status TEXT DEFAULT 'confirmed',
    payment_status TEXT DEFAULT 'pending',
    total_cost DECIMAL(10,2),
    attendees INTEGER DEFAULT 1,
    booking_notes TEXT,
    cancellation_reason TEXT
);

-- 3. RECREATE MATCHES TABLE
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    organizer_id UUID REFERENCES auth.users(id),
    
    title TEXT,
    description TEXT,
    level_min NUMERIC(2,1),
    level_max NUMERIC(2,1),
    
    is_public BOOLEAN DEFAULT true,
    max_players INTEGER DEFAULT 4,
    current_players INTEGER DEFAULT 1,
    
    status TEXT DEFAULT 'open'
);

-- 4. RECREATE MATCH PLAYERS TABLE
CREATE TABLE match_players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    
    status TEXT DEFAULT 'registered'
);

-- 5. RECREATE INDEXES
CREATE INDEX idx_bookings_time_range ON bookings USING gist (time_range);
CREATE INDEX idx_bookings_court_date ON bookings (court_id, booking_date);
CREATE INDEX idx_bookings_user ON bookings (user_id);
CREATE INDEX idx_bookings_club ON bookings (club_id);

-- 6. RECREATE RLS POLICIES
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON bookings FOR SELECT USING (true);
CREATE POLICY "Authenticated create" ON bookings FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own" ON bookings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Service role full access" ON bookings FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Public read matches" ON matches FOR SELECT USING (true);
CREATE POLICY "Auth create matches" ON matches FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Public read players" ON match_players FOR SELECT USING (true);
CREATE POLICY "Auth create players" ON match_players FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 7. RECREATE TRIGGER FUNCTION & TRIGGER
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

CREATE TRIGGER booking_time_range_trigger
    BEFORE INSERT OR UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_booking_time_range();

-- 8. RECREATE ATOMIC BOOKING FUNCTION
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
