-- PHASE 2: Growth Features - Substitute Finder System
-- Database schema for player availability, substitute requests, and notifications.

-- =============================================================================
-- PLAYER_AVAILABILITY TABLE
-- Where players can register their available time slots.
-- =============================================================================

CREATE TABLE player_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, club_id, start_time, end_time)
);

-- =============================================================================
-- SUBSTITUTE_REQUESTS TABLE
-- Stores requests for substitutes.
-- =============================================================================

CREATE TABLE substitute_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    requesting_user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, filled, cancelled
    filled_by_user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- NOTIFICATIONS TABLE
-- Stores push notifications to be sent to users.
-- =============================================================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Realtime on the notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- =============================================================================
-- RPC FUNCTION TO REQUEST A SUBSTITUTE
-- =============================================================================

CREATE OR REPLACE FUNCTION request_substitute(
    p_booking_id UUID,
    p_requesting_user_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_substitute_request_id UUID;
    v_available_player RECORD;
BEGIN
    -- Create a substitute request
    INSERT INTO substitute_requests (booking_id, requesting_user_id)
    VALUES (p_booking_id, p_requesting_user_id)
    RETURNING id INTO v_substitute_request_id;

    -- Find available players and create notifications
    FOR v_available_player IN
        SELECT user_id FROM player_availability
        -- Add logic here to match availability with booking time
    LOOP
        INSERT INTO notifications (user_id, title, message)
        VALUES (
            v_available_player.user_id,
            'Substitute needed!',
            'A player is needed for a booking. Are you available?'
        );
    END LOOP;
END;
$$;

GRANT EXECUTE ON FUNCTION request_substitute(UUID, UUID) TO authenticated;
