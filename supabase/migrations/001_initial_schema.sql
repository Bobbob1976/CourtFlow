-- PHASE 1: Foundation - Database Schema for Multi-Tenant Court Booking System
-- Generated for Supabase/PostgreSQL

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- CLUBS TABLE (Tenants)
-- =============================================================================

CREATE TABLE clubs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(50) UNIQUE NOT NULL, -- Used for subdomain routing
    brand_color VARCHAR(7) NOT NULL, -- Hex color code like "#FF5733"
    subscription_tier VARCHAR(20) NOT NULL DEFAULT 'basic', -- basic, premium, enterprise
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, suspended, cancelled
    settings JSONB DEFAULT '{}', -- Flexible club-specific settings
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);

-- Indexes for clubs table
CREATE INDEX idx_clubs_subdomain ON clubs(subdomain) WHERE deleted_at IS NULL;
CREATE INDEX idx_clubs_status ON clubs(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_clubs_subscription_tier ON clubs(subscription_tier) WHERE deleted_at IS NULL;

-- =============================================================================
-- COURTS TABLE
-- =============================================================================

CREATE TABLE courts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    court_type VARCHAR(50) NOT NULL, -- indoor, outdoor, clay, hard, grass
    hourly_rate DECIMAL(10,2) NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 2, -- Max players per booking
    equipment_provided TEXT[], -- Array of available equipment
    surface_type VARCHAR(50),
    lighting BOOLEAN DEFAULT false,
    indoor BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    description TEXT,
    images TEXT[], -- Array of image URLs
    operating_hours JSONB DEFAULT '{}', -- Flexible schedule configuration
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);

-- Indexes for courts table
CREATE INDEX idx_courts_club_id ON courts(club_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_courts_active ON courts(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_courts_type ON courts(court_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_courts_hourly_rate ON courts(hourly_rate) WHERE deleted_at IS NULL;

-- =============================================================================
-- USERS TABLE (Using Supabase Auth.users as base, extending with profile)
-- =============================================================================

CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    club_id UUID REFERENCES clubs(id) ON DELETE SET NULL, -- Primary club association
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL DEFAULT 'member', -- admin, member, staff, owner
    membership_status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, expired, suspended
    preferences JSONB DEFAULT '{}', -- User preferences and settings
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for user_profiles table
CREATE INDEX idx_user_profiles_club_id ON user_profiles(club_id);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_membership_status ON user_profiles(membership_status);

-- =============================================================================
-- BOOKINGS TABLE
-- =============================================================================

CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    court_id UUID NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'confirmed', -- confirmed, cancelled, completed, no-show
    total_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, paid, refunded, failed
    payment_method VARCHAR(50),
    booking_notes TEXT,
    attendees INTEGER DEFAULT 1, -- Number of people in the booking
    equipment_rented TEXT[], -- Array of equipment that was rented
    cancellation_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    cancelled_at TIMESTAMP WITH TIME ZONE NULL
);

-- Indexes for bookings table
CREATE INDEX idx_bookings_club_id ON bookings(club_id);
CREATE INDEX idx_bookings_court_id ON bookings(court_id);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_bookings_club_date ON bookings(club_id, booking_date);
CREATE INDEX idx_bookings_court_date ON bookings(court_id, booking_date);
CREATE INDEX idx_bookings_user_date ON bookings(user_id, booking_date);
CREATE INDEX idx_bookings_status ON bookings(status);

-- =============================================================================
-- CROSS-TENANT ACCESS CONTROL TABLES
-- =============================================================================

-- Club staff/permissions for multi-club access
CREATE TABLE club_staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    permissions JSONB DEFAULT '["read"]', -- Array of permissions: read, write, admin
    granted_by UUID REFERENCES user_profiles(id),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, club_id)
);

CREATE INDEX idx_club_staff_user_club ON club_staff(user_id, club_id);
CREATE INDEX idx_club_staff_club ON club_staff(club_id);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_staff ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- RLS POLICIES FOR CLUBS TABLE
-- =============================================================================

-- Users can only see clubs they have access to
CREATE POLICY "Users can view accessible clubs" ON clubs
    FOR SELECT USING (
        deleted_at IS NULL AND (
            -- Club owners/admins can see their own club
            auth.uid() IN (
                SELECT user_id FROM user_profiles 
                WHERE club_id = clubs.id AND role IN ('owner', 'admin')
            ) OR
            -- Users can see clubs they have staff access to
            auth.uid() IN (
                SELECT user_id FROM club_staff 
                WHERE club_id = clubs.id 
                AND (expires_at IS NULL OR expires_at > NOW())
            ) OR
            -- Service role can see all clubs
            auth.role() = 'service_role'
        )
    );

-- Only service role can modify clubs (admin operations)
CREATE POLICY "Service role can manage clubs" ON clubs
    FOR ALL USING (auth.role() = 'service_role');

-- =============================================================================
-- RLS POLICIES FOR COURTS TABLE
-- =============================================================================

-- Users can only see courts for clubs they have access to
CREATE POLICY "Users can view accessible courts" ON courts
    FOR SELECT USING (
        deleted_at IS NULL AND (
            -- Court belongs to a club user has access to
            club_id IN (
                SELECT up.club_id FROM user_profiles up 
                WHERE up.id = auth.uid() AND up.role IN ('owner', 'admin')
                UNION
                SELECT cs.club_id FROM club_staff cs 
                WHERE cs.user_id = auth.uid() 
                AND (cs.expires_at IS NULL OR cs.expires_at > NOW())
            ) OR
            -- Service role can see all courts
            auth.role() = 'service_role'
        )
    );

-- Only club owners/admins can modify courts
CREATE POLICY "Club owners/admins can manage courts" ON courts
    FOR ALL USING (
        club_id IN (
            SELECT up.club_id FROM user_profiles up 
            WHERE up.id = auth.uid() AND up.role IN ('owner', 'admin')
        )
    );

-- =============================================================================
-- RLS POLICIES FOR USER_PROFILES TABLE
-- =============================================================================

-- Users can see profiles for clubs they have access to
CREATE POLICY "Users can view accessible profiles" ON user_profiles
    FOR SELECT USING (
        club_id IN (
            SELECT up.club_id FROM user_profiles up 
            WHERE up.id = auth.uid() AND up.role IN ('owner', 'admin')
            UNION
            SELECT cs.club_id FROM club_staff cs 
            WHERE cs.user_id = auth.uid() 
            AND (cs.expires_at IS NULL OR cs.expires_at > NOW())
        ) OR
        -- Users can see their own profile
        id = auth.uid() OR
        -- Service role can see all profiles
        auth.role() = 'service_role'
    );

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (id = auth.uid());

-- Only club owners/admins can modify other profiles
CREATE POLICY "Club owners/admins can manage profiles" ON user_profiles
    FOR ALL USING (
        club_id IN (
            SELECT up.club_id FROM user_profiles up 
            WHERE up.id = auth.uid() AND up.role IN ('owner', 'admin')
        )
    );

-- =============================================================================
-- RLS POLICIES FOR BOOKINGS TABLE
-- =============================================================================

-- Users can see bookings for clubs they have access to
CREATE POLICY "Users can view accessible bookings" ON bookings
    FOR SELECT USING (
        club_id IN (
            SELECT up.club_id FROM user_profiles up 
            WHERE up.id = auth.uid() AND up.role IN ('owner', 'admin')
            UNION
            SELECT cs.club_id FROM club_staff cs 
            WHERE cs.user_id = auth.uid() 
            AND (cs.expires_at IS NULL OR cs.expires_at > NOW())
        ) OR
        -- Users can see their own bookings
        user_id = auth.uid() OR
        -- Service role can see all bookings
        auth.role() = 'service_role'
    );

-- Users can create bookings for clubs they have access to
CREATE POLICY "Users can create bookings" ON bookings
    FOR INSERT WITH CHECK (
        club_id IN (
            SELECT up.club_id FROM user_profiles up 
            WHERE up.id = auth.uid()
            UNION
            SELECT cs.club_id FROM club_staff cs 
            WHERE cs.user_id = auth.uid() 
            AND (cs.expires_at IS NULL OR cs.expires_at > NOW())
        )
    );

-- Users can update their own bookings, club admins can update all bookings
CREATE POLICY "Users can update bookings" ON bookings
    FOR UPDATE USING (
        user_id = auth.uid() OR
        club_id IN (
            SELECT up.club_id FROM user_profiles up 
            WHERE up.id = auth.uid() AND up.role IN ('owner', 'admin')
        )
    );

-- Users can cancel their own bookings, club admins can cancel all bookings
CREATE POLICY "Users can cancel bookings" ON bookings
    FOR UPDATE USING (
        user_id = auth.uid() OR
        club_id IN (
            SELECT up.club_id FROM user_profiles up 
            WHERE up.id = auth.uid() AND up.role IN ('owner', 'admin')
        )
    );

-- =============================================================================
-- RLS POLICIES FOR CLUB_STAFF TABLE
-- =============================================================================

-- Only club owners/admins can manage staff access
CREATE POLICY "Club owners/admins can manage staff" ON club_staff
    FOR ALL USING (
        club_id IN (
            SELECT up.club_id FROM user_profiles up 
            WHERE up.id = auth.uid() AND up.role IN ('owner', 'admin')
        )
    );

-- Users can see their own staff records
CREATE POLICY "Users can view own staff records" ON club_staff
    FOR SELECT USING (user_id = auth.uid());

-- =============================================================================
-- TRIGGERS FOR UPDATED_AT AUTOMATION
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables with updated_at column
CREATE TRIGGER update_clubs_updated_at BEFORE UPDATE ON clubs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courts_updated_at BEFORE UPDATE ON courts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Function to get user's accessible club IDs
CREATE OR REPLACE FUNCTION get_user_club_ids(user_uuid UUID DEFAULT auth.uid())
RETURNS TABLE(club_id UUID) AS $$
BEGIN
    RETURN QUERY
    -- Direct club membership
    SELECT up.club_id FROM user_profiles up 
    WHERE up.id = user_uuid
    UNION
    -- Staff access
    SELECT cs.club_id FROM club_staff cs 
    WHERE cs.user_id = user_uuid 
    AND (cs.expires_at IS NULL OR cs.expires_at > NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can access a specific club
CREATE OR REPLACE FUNCTION user_can_access_club(user_uuid UUID, club_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM get_user_club_ids(user_uuid) WHERE club_id = club_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- SAMPLE DATA (Optional - for testing)
-- =============================================================================

-- Insert sample clubs (comment out if not needed for production)
-- INSERT INTO clubs (name, subdomain, brand_color, subscription_tier) VALUES
-- ('Tennis Club Amsterdam', 'amsterdam', '#FF5733', 'premium'),
-- ('Padel Center Rotterdam', 'rotterdam', '#28A745', 'basic'),
-- ('Sport Complex Utrecht', 'utrecht', '#007BFF', 'enterprise');

-- =============================================================================
-- COMPLETION MESSAGE
-- =============================================================================

-- Database schema created successfully!
-- This script sets up:
-- 1. Multi-tenant structure with clubs as tenants
-- 2. Courts linked to clubs
-- 3. Bookings linked to courts and users
-- 4. Comprehensive RLS policies preventing cross-tenant data access
-- 5. Helper functions for access control
-- 6. Proper indexing for performance
-- 7. Audit trails with created_at/updated_at timestamps