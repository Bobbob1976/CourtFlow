-- PHASE 1 MVP: Complete Foundation Schema + Test Data
-- Run this in Supabase Dashboard > SQL Editor

-- 001_initial_schema.sql content
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE clubs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(50) UNIQUE NOT NULL,
    brand_color VARCHAR(7) NOT NULL,
    subscription_tier VARCHAR(20) NOT NULL DEFAULT 'starter',
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);

CREATE INDEX idx_clubs_subdomain ON clubs(subdomain) WHERE deleted_at IS NULL;

CREATE TABLE courts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    court_type VARCHAR(50) NOT NULL,
    hourly_rate DECIMAL(10,2) NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 2,
    equipment_provided TEXT[],
    surface_type VARCHAR(50),
    lighting BOOLEAN DEFAULT false,
    indoor BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    description TEXT,
    images TEXT[],
    operating_hours JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);

CREATE INDEX idx_courts_club_id ON courts(club_id) WHERE deleted_at IS NULL;

CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    club_id UUID REFERENCES clubs(id) ON DELETE SET NULL,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL DEFAULT 'member',
    membership_status VARCHAR(20) NOT NULL DEFAULT 'active',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_profiles_club_id ON user_profiles(club_id);

CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    court_id UUID NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'confirmed',
    total_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
    payment_method VARCHAR(50),
    booking_notes TEXT,
    attendees INTEGER DEFAULT 1,
    equipment_rented TEXT[],
    cancellation_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    cancelled_at TIMESTAMP WITH TIME ZONE NULL
);

CREATE INDEX idx_bookings_club_id ON bookings(club_id);
CREATE INDEX idx_bookings_court_id ON bookings(court_id);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_date ON bookings(booking_date);

ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Simplified RLS for MVP
CREATE POLICY "Public read clubs" ON clubs FOR SELECT USING (true);
CREATE POLICY "Public read courts" ON courts FOR SELECT USING (true);
CREATE POLICY "Users read own profile" ON user_profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users insert own profile" ON user_profiles FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "Users update own profile" ON user_profiles FOR UPDATE USING (id = auth.uid());

-- 002_atomic_booking_engine.sql content (abbreviated for MVP)
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS time_range tstzrange;

CREATE OR REPLACE FUNCTION update_booking_time_range()
RETURNS TRIGGER AS $$
BEGIN
    NEW.time_range = tstzrange(
        NEW.booking_date + NEW.start_time,
        NEW.booking_date + NEW.end_time,
        '[)'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS booking_time_range_trigger ON bookings;
CREATE TRIGGER booking_time_range_trigger BEFORE INSERT OR UPDATE ON bookings
FOR EACH ROW EXECUTE FUNCTION update_booking_time_range();

CREATE OR REPLACE FUNCTION create_atomic_booking(
    p_club_id UUID,
    p_court_id UUID, 
    p_user_id UUID,
    p_start_time TIME,
    p_end_time TIME,
    p_total_price DECIMAL(10,2),
    p_booking_date DATE DEFAULT CURRENT_DATE,
    p_attendees INTEGER DEFAULT 1,
    p_booking_notes TEXT DEFAULT NULL
) RETURNS JSON
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    booking_id UUID;
    new_booking JSON;
    booking_range tstzrange;
    overlap_count INTEGER;
BEGIN
    IF p_start_time >= p_end_time THEN
        RAISE EXCEPTION 'Start time must be before end time';
    END IF;

    booking_range = tstzrange(p_booking_date + p_start_time, p_booking_date + p_end_time, '[)');

    SELECT COUNT(*) INTO overlap_count FROM bookings b
    WHERE b.court_id = p_court_id
    AND b.status != 'cancelled'
    AND b.time_range && booking_range;

    IF overlap_count > 0 THEN
        RAISE EXCEPTION 'Time slot unavailable';
    END IF;

    INSERT INTO bookings (club_id, court_id, user_id, booking_date, start_time, end_time, total_cost, attendees, booking_notes)
    VALUES (p_club_id, p_court_id, p_user_id, p_booking_date, p_start_time, p_end_time, p_total_price, p_attendees, p_booking_notes)
    RETURNING id INTO booking_id;

    SELECT row_to_json(b.*) INTO new_booking FROM bookings b WHERE b.id = booking_id;

    RETURN new_booking;
END;
$$;

CREATE INDEX idx_bookings_time_range_gist ON bookings USING gist (time_range);

-- TEST DATA
-- Test Club
INSERT INTO clubs (name, subdomain, brand_color) VALUES ('Demo Padel Club', 'demo', '#3B82F6') ON CONFLICT (subdomain) DO NOTHING;

-- Test Courts
INSERT INTO courts (club_id, name, court_type, hourly_rate, capacity) VALUES 
((SELECT id FROM clubs WHERE subdomain = 'demo'), 'Baan 1', 'padel', 25.00, 4),
((SELECT id FROM clubs WHERE subdomain = 'demo'), 'Baan 2', 'padel', 25.00, 4)
ON CONFLICT DO NOTHING;

-- Update your profile with club_id after login
-- UPDATE user_profiles SET club_id = (SELECT id FROM clubs WHERE subdomain = 'demo') WHERE id = auth.uid();

-- Run in Supabase SQL Editor!
