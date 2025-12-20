-- PHASE 2: Growth Features - Split Payment System
-- Database migration for booking_shares table to enable payment splitting

-- Enable uuid-ossp extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- BOOKING_SHARES TABLE
-- =============================================================================

CREATE TABLE booking_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL, -- Nullable for guest players
    share_amount DECIMAL(10,2) NOT NULL, -- Amount this person owes (e.g., 10.00)
    service_fee DECIMAL(10,2) NOT NULL DEFAULT 0.25, -- Our platform fee (€0.25 per split)
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, paid, failed, cancelled
    stripe_payment_intent_id TEXT,
    payment_link_token UUID UNIQUE DEFAULT uuid_generate_v4(), -- Unique token for sharing via WhatsApp
    share_number INTEGER NOT NULL, -- Position in the split (1, 2, 3, 4, etc.)
    total_amount DECIMAL(10,2) NOT NULL, -- Total amount: share_amount + service_fee
    paid_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure each booking has unique share numbers
    CONSTRAINT unique_booking_share_number UNIQUE(booking_id, share_number),
    -- Ensure share amounts are positive
    CONSTRAINT positive_share_amount CHECK (share_amount > 0),
    -- Ensure service fee is positive
    CONSTRAINT positive_service_fee CHECK (service_fee >= 0)
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Index for finding shares by booking
CREATE INDEX idx_booking_shares_booking_id ON booking_shares(booking_id);

-- Index for finding shares by user
CREATE INDEX idx_booking_shares_user_id ON booking_shares(user_id);

-- Index for payment link lookup (very common query)
CREATE INDEX idx_booking_shares_payment_token ON booking_shares(payment_link_token);

-- Index for payment status queries
CREATE INDEX idx_booking_shares_payment_status ON booking_shares(payment_status);

-- Composite index for share status by booking
CREATE INDEX idx_booking_shares_booking_status ON booking_shares(booking_id, payment_status);

-- =============================================================================
-- RLS POLICIES
-- =============================================================================

ALTER TABLE booking_shares ENABLE ROW LEVEL SECURITY;

-- Users can see their own shares
CREATE POLICY "Users can view own shares" ON booking_shares
    FOR SELECT USING (
        user_id = auth.uid() OR
        -- Or if they're part of the booking (should be the same, but defensive)
        booking_id IN (
            SELECT b.id FROM bookings b WHERE b.user_id = auth.uid()
        )
    );

-- Users can create shares for bookings they own
CREATE POLICY "Users can create shares for own bookings" ON booking_shares
    FOR INSERT WITH CHECK (
        booking_id IN (
            SELECT b.id FROM bookings b WHERE b.user_id = auth.uid()
        )
    );

-- Users can update their own shares
CREATE POLICY "Users can update own shares" ON booking_shares
    FOR UPDATE USING (user_id = auth.uid());

-- Users can cancel their own shares (before payment)
CREATE POLICY "Users can cancel own shares" ON booking_shares
    FOR UPDATE USING (
        user_id = auth.uid() 
        AND payment_status = 'pending'
    );

-- Service role can manage all shares (for webhooks and admin operations)
CREATE POLICY "Service role can manage all shares" ON booking_shares
    FOR ALL USING (auth.role() = 'service_role');

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Function to get booking share summary
CREATE OR REPLACE FUNCTION get_booking_shares_summary(p_booking_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    booking_info RECORD;
    shares_info JSON;
    total_collected DECIMAL(10,2);
    pending_amount DECIMAL(10,2);
    paid_count INTEGER;
    total_count INTEGER;
    result JSON;
BEGIN
    -- Verify user has access to this booking
    IF NOT EXISTS (
        SELECT 1 FROM bookings b 
        WHERE b.id = p_booking_id 
        AND (b.user_id = auth.uid() OR auth.role() = 'service_role')
    ) THEN
        RAISE EXCEPTION 'Access denied to booking shares';
    END IF;

    -- Get booking info
    SELECT b.*, c.name as club_name, ct.name as court_name
    INTO booking_info
    FROM bookings b
    JOIN clubs c ON c.id = b.club_id
    JOIN courts ct ON ct.id = b.court_id
    WHERE b.id = p_booking_id;

    -- Get all shares for this booking
    SELECT json_agg(
        json_build_object(
            'id', bs.id,
            'share_number', bs.share_number,
            'amount', bs.share_amount,
            'service_fee', bs.service_fee,
            'total_amount', bs.total_amount,
            'payment_status', bs.payment_status,
            'payment_link_token', bs.payment_link_token,
            'user_id', bs.user_id,
            'paid_at', bs.paid_at,
            'created_at', bs.created_at
        ) ORDER BY bs.share_number
    ) INTO shares_info
    FROM booking_shares bs
    WHERE bs.booking_id = p_booking_id;

    -- Calculate summary stats
    SELECT 
        COALESCE(SUM(CASE WHEN bs.payment_status = 'paid' THEN bs.total_amount END), 0),
        COALESCE(SUM(CASE WHEN bs.payment_status = 'pending' THEN bs.total_amount END), 0),
        COUNT(CASE WHEN bs.payment_status = 'paid' THEN 1 END),
        COUNT(*)
    INTO total_collected, pending_amount, paid_count, total_count
    FROM booking_shares bs
    WHERE bs.booking_id = p_booking_id;

    -- Build result
    result := json_build_object(
        'booking', json_build_object(
            'id', booking_info.id,
            'club_name', booking_info.club_name,
            'court_name', booking_info.court_name,
            'booking_date', booking_info.booking_date,
            'start_time', booking_info.start_time,
            'end_time', booking_info.end_time,
            'total_cost', booking_info.total_cost,
            'attendees', booking_info.attendees
        ),
        'shares', COALESCE(shares_info, '[]'::json),
        'summary', json_build_object(
            'total_shares', total_count,
            'paid_shares', paid_count,
            'pending_shares', total_count - paid_count,
            'total_collected', total_collected,
            'total_pending', pending_amount,
            'completion_percentage', CASE 
                WHEN total_count > 0 THEN ROUND((paid_count::decimal / total_count::decimal) * 100, 1)
                ELSE 0 
            END
        )
    );

    RETURN result;
END;
$$;

-- Function to get share by payment token
CREATE OR REPLACE FUNCTION get_share_by_token(p_token UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    share_info RECORD;
    booking_info RECORD;
    result JSON;
BEGIN
    -- Get share info
    SELECT bs.*, b.club_id, b.user_id as booking_owner_id
    INTO share_info
    FROM booking_shares bs
    JOIN bookings b ON b.id = bs.booking_id
    WHERE bs.payment_link_token = p_token;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Payment link not found or expired';
    END IF;

    -- Get booking details
    SELECT b.*, c.name as club_name, c.subdomain, ct.name as court_name
    INTO booking_info
    FROM bookings b
    JOIN clubs c ON c.id = b.club_id
    JOIN courts ct ON ct.id = b.court_id
    WHERE b.id = share_info.booking_id;

    -- Build result
    result := json_build_object(
        'share', json_build_object(
            'id', share_info.id,
            'share_number', share_info.share_number,
            'amount', share_info.share_amount,
            'service_fee', share_info.service_fee,
            'total_amount', share_info.total_amount,
            'payment_status', share_info.payment_status,
            'payment_link_token', share_info.payment_link_token,
            'created_at', share_info.created_at
        ),
        'booking', json_build_object(
            'id', booking_info.id,
            'club_name', booking_info.club_name,
            'club_subdomain', booking_info.subdomain,
            'court_name', booking_info.court_name,
            'booking_date', booking_info.booking_date,
            'start_time', booking_info.start_time,
            'end_time', booking_info.end_time
        )
    );

    RETURN result;
END;
$$;

-- Grant execution to anon and authenticated roles so it can be called from the client/server
GRANT EXECUTE ON FUNCTION get_share_by_token(p_token UUID) TO anon, authenticated;

-- Function to update share payment status
CREATE OR REPLACE FUNCTION update_share_payment_status(
    p_share_id UUID,
    p_payment_intent_id TEXT,
    p_new_status VARCHAR(20)
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE booking_shares SET
        stripe_payment_intent_id = p_payment_intent_id,
        payment_status = p_new_status,
        paid_at = CASE WHEN p_new_status = 'paid' THEN NOW() ELSE NULL END,
        updated_at = NOW()
    WHERE id = p_share_id;
END;
$$;

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_booking_shares_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to booking_shares table
CREATE TRIGGER booking_shares_updated_at_trigger
    BEFORE UPDATE ON booking_shares
    FOR EACH ROW
    EXECUTE FUNCTION update_booking_shares_updated_at();

-- Function to validate share totals
CREATE OR REPLACE FUNCTION validate_share_totals()
RETURNS TRIGGER AS $$
DECLARE
    total_shares DECIMAL(10,2);
    booking_total DECIMAL(10,2);
BEGIN
    -- Get total of all shares for this booking
    SELECT COALESCE(SUM(share_amount), 0) INTO total_shares
    FROM booking_shares 
    WHERE booking_id = NEW.booking_id 
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);

    -- Add current share amount
    total_shares := total_shares + NEW.share_amount;

    -- Get booking total
    SELECT total_cost INTO booking_total
    FROM bookings 
    WHERE id = NEW.booking_id;

    -- Validate that shares don't exceed booking total (allowing small rounding differences)
    IF total_shares > booking_total + 0.01 THEN
        RAISE EXCEPTION 'Share amounts (€%) exceed booking total (€%). Total shares: %, Booking total: %', 
            total_shares, booking_total, total_shares, booking_total;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to validate totals
CREATE TRIGGER booking_shares_validate_totals_trigger
    BEFORE INSERT OR UPDATE ON booking_shares
    FOR EACH ROW
    EXECUTE FUNCTION validate_share_totals();

-- =============================================================================
-- SAMPLE DATA (Optional - for testing)
-- =============================================================================

-- This function creates sample shares for testing
CREATE OR REPLACE FUNCTION create_sample_shares(p_booking_id UUID, p_num_shares INTEGER DEFAULT 4)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    booking_total DECIMAL(10,2);
    share_amount DECIMAL(10,2);
    i INTEGER;
BEGIN
    -- Get booking total
    SELECT total_cost INTO booking_total FROM bookings WHERE id = p_booking_id;
    
    -- Calculate amount per person
    share_amount := booking_total / p_num_shares;
    
    -- Create shares
    FOR i IN 1..p_num_shares LOOP
        INSERT INTO booking_shares (
            booking_id,
            share_amount,
            service_fee,
            share_number,
            total_amount,
            payment_status
        ) VALUES (
            p_booking_id,
            share_amount,
            0.25, -- €0.25 service fee
            i,
            share_amount + 0.25,
            'pending'
        );
    END LOOP;
END;
$$;

-- =============================================================================
-- COMPLETION MESSAGE
-- =============================================================================

-- Split Payment Database Schema Created Successfully!
-- 
-- New Features:
-- 1. booking_shares table with comprehensive payment tracking
-- 2. Payment link tokens for easy sharing via WhatsApp
-- 3. RLS policies ensuring privacy and security
-- 4. Helper functions for summary and token lookup
-- 5. Validation to prevent oversharing
-- 6. Automatic payment status tracking
-- 
-- Usage:
-- SELECT get_booking_shares_summary('booking-uuid');
-- SELECT get_share_by_token('token-uuid');
-- SELECT create_sample_shares('booking-uuid', 4);
-- 
-- The database is ready for split payment processing!