-- Loyalty points system
-- Earn points for bookings, referrals, and other activities

-- Loyalty points balance table
CREATE TABLE IF NOT EXISTS loyalty_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    balance INTEGER DEFAULT 0,
    lifetime_earned INTEGER DEFAULT 0,
    lifetime_spent INTEGER DEFAULT 0,
    tier VARCHAR(50) DEFAULT 'bronze', -- bronze, silver, gold, platinum
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, club_id)
);

-- Points transactions table
CREATE TABLE IF NOT EXISTS points_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    club_id UUID NOT NULL REFERENCES clubs(id),
    points INTEGER NOT NULL, -- Positive for earning, negative for spending
    type VARCHAR(50) NOT NULL, -- booking, referral, birthday, review, redemption
    description TEXT,
    booking_id UUID REFERENCES bookings(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rewards catalog table
CREATE TABLE IF NOT EXISTS rewards_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    points_cost INTEGER NOT NULL,
    reward_type VARCHAR(50) NOT NULL, -- discount, free_booking, merchandise, upgrade
    reward_value JSONB, -- Flexible value (e.g., {"discount_percentage": 10} or {"free_hours": 1})
    is_active BOOLEAN DEFAULT true,
    stock_quantity INTEGER, -- NULL for unlimited
    image_url TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Points redemptions table
CREATE TABLE IF NOT EXISTS points_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    club_id UUID NOT NULL REFERENCES clubs(id),
    reward_id UUID NOT NULL REFERENCES rewards_catalog(id),
    points_spent INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, redeemed, expired
    redeemed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_redemptions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own points"
    ON loyalty_points FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions"
    ON points_transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view active rewards"
    ON rewards_catalog FOR SELECT
    USING (is_active = true);

CREATE POLICY "Users can view own redemptions"
    ON points_redemptions FOR SELECT
    USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_loyalty_points_user ON loyalty_points(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_points_club ON loyalty_points(club_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_user ON points_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_type ON points_transactions(type);
CREATE INDEX IF NOT EXISTS idx_rewards_catalog_club ON rewards_catalog(club_id);
CREATE INDEX IF NOT EXISTS idx_points_redemptions_user ON points_redemptions(user_id);

-- Grant permissions
GRANT ALL ON loyalty_points TO authenticated, service_role;
GRANT ALL ON points_transactions TO authenticated, service_role;
GRANT ALL ON rewards_catalog TO authenticated, service_role;
GRANT ALL ON points_redemptions TO authenticated, service_role;

-- Function to award points
CREATE OR REPLACE FUNCTION award_points(
    p_user_id UUID,
    p_club_id UUID,
    p_points INTEGER,
    p_type VARCHAR,
    p_description TEXT DEFAULT NULL,
    p_booking_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    -- Insert transaction
    INSERT INTO points_transactions (user_id, club_id, points, type, description, booking_id)
    VALUES (p_user_id, p_club_id, p_points, p_type, p_description, p_booking_id);

    -- Update balance (create if doesn't exist)
    INSERT INTO loyalty_points (user_id, club_id, balance, lifetime_earned)
    VALUES (p_user_id, p_club_id, p_points, p_points)
    ON CONFLICT (user_id, club_id)
    DO UPDATE SET
        balance = loyalty_points.balance + p_points,
        lifetime_earned = loyalty_points.lifetime_earned + p_points,
        updated_at = NOW();

    -- Update tier based on lifetime points
    UPDATE loyalty_points
    SET tier = CASE
        WHEN lifetime_earned >= 10000 THEN 'platinum'
        WHEN lifetime_earned >= 5000 THEN 'gold'
        WHEN lifetime_earned >= 2000 THEN 'silver'
        ELSE 'bronze'
    END
    WHERE user_id = p_user_id AND club_id = p_club_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to spend points
CREATE OR REPLACE FUNCTION spend_points(
    p_user_id UUID,
    p_club_id UUID,
    p_points INTEGER,
    p_reward_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_current_balance INTEGER;
BEGIN
    -- Check balance
    SELECT balance INTO v_current_balance
    FROM loyalty_points
    WHERE user_id = p_user_id AND club_id = p_club_id;

    IF v_current_balance IS NULL OR v_current_balance < p_points THEN
        RETURN FALSE;
    END IF;

    -- Deduct points
    INSERT INTO points_transactions (user_id, club_id, points, type, description)
    VALUES (p_user_id, p_club_id, -p_points, 'redemption', 'Reward redemption');

    UPDATE loyalty_points
    SET balance = balance - p_points,
        lifetime_spent = lifetime_spent + p_points,
        updated_at = NOW()
    WHERE user_id = p_user_id AND club_id = p_club_id;

    -- Create redemption record
    INSERT INTO points_redemptions (user_id, club_id, reward_id, points_spent, expires_at)
    VALUES (p_user_id, p_club_id, p_reward_id, p_points, NOW() + INTERVAL '30 days');

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default rewards for demo club
INSERT INTO rewards_catalog (club_id, name, description, points_cost, reward_type, reward_value, display_order)
VALUES 
(
    '90f93d47-b438-427c-8b33-0597817c1d96',
    '10% Discount Voucher',
    'Get 10% off your next booking',
    500,
    'discount',
    '{"discount_percentage": 10, "valid_days": 30}',
    1
),
(
    '90f93d47-b438-427c-8b33-0597817c1d96',
    'Free 1-Hour Court',
    'Redeem for 1 hour of free court time',
    1000,
    'free_booking',
    '{"free_hours": 1}',
    2
),
(
    '90f93d47-b438-427c-8b33-0597817c1d96',
    'Premium Court Upgrade',
    'Upgrade to premium court for free',
    750,
    'upgrade',
    '{"upgrade_type": "premium"}',
    3
),
(
    '90f93d47-b438-427c-8b33-0597817c1d96',
    'CourtFlow T-Shirt',
    'Exclusive branded merchandise',
    2000,
    'merchandise',
    '{"item": "tshirt", "size_options": ["S", "M", "L", "XL"]}',
    4
),
(
    '90f93d47-b438-427c-8b33-0597817c1d96',
    '25% Discount Voucher',
    'Get 25% off your next booking',
    1500,
    'discount',
    '{"discount_percentage": 25, "valid_days": 30}',
    5
)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE loyalty_points IS 'User loyalty points balance and tier status';
COMMENT ON TABLE points_transactions IS 'History of all points earned and spent';
COMMENT ON TABLE rewards_catalog IS 'Available rewards that can be redeemed with points';
COMMENT ON TABLE points_redemptions IS 'Record of reward redemptions';
