-- Membership system for clubs
-- Supports different membership tiers with benefits

-- Membership tiers table
CREATE TABLE IF NOT EXISTS membership_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price_monthly DECIMAL(10,2) NOT NULL,
    price_yearly DECIMAL(10,2),
    benefits JSONB DEFAULT '[]', -- Array of benefit strings
    discount_percentage INTEGER DEFAULT 0, -- Discount on bookings
    priority_booking BOOLEAN DEFAULT false,
    max_bookings_per_month INTEGER,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User memberships table
CREATE TABLE IF NOT EXISTS user_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    tier_id UUID NOT NULL REFERENCES membership_tiers(id),
    status VARCHAR(50) DEFAULT 'active', -- active, cancelled, expired, pending
    billing_cycle VARCHAR(20) DEFAULT 'monthly', -- monthly, yearly
    start_date DATE NOT NULL,
    end_date DATE,
    next_billing_date DATE,
    auto_renew BOOLEAN DEFAULT true,
    bookings_used_this_month INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    cancelled_at TIMESTAMPTZ,
    UNIQUE(user_id, club_id)
);

-- Membership payments table
CREATE TABLE IF NOT EXISTS membership_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    membership_id UUID NOT NULL REFERENCES user_memberships(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, paid, failed, refunded
    payment_method VARCHAR(50),
    mollie_payment_id VARCHAR(255),
    billing_period_start DATE NOT NULL,
    billing_period_end DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE membership_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_payments ENABLE ROW LEVEL SECURITY;

-- Policies for membership_tiers
CREATE POLICY "Anyone can view active tiers"
    ON membership_tiers FOR SELECT
    USING (is_active = true);

CREATE POLICY "Admins can manage tiers"
    ON membership_tiers FOR ALL
    USING (true);

-- Policies for user_memberships
CREATE POLICY "Users can view own memberships"
    ON user_memberships FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all memberships"
    ON user_memberships FOR SELECT
    USING (true);

CREATE POLICY "Users can create own memberships"
    ON user_memberships FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own memberships"
    ON user_memberships FOR UPDATE
    USING (auth.uid() = user_id);

-- Policies for membership_payments
CREATE POLICY "Users can view own payments"
    ON membership_payments FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all payments"
    ON membership_payments FOR SELECT
    USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_membership_tiers_club ON membership_tiers(club_id);
CREATE INDEX IF NOT EXISTS idx_user_memberships_user ON user_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_user_memberships_club ON user_memberships(club_id);
CREATE INDEX IF NOT EXISTS idx_user_memberships_status ON user_memberships(status);
CREATE INDEX IF NOT EXISTS idx_membership_payments_membership ON membership_payments(membership_id);
CREATE INDEX IF NOT EXISTS idx_membership_payments_user ON membership_payments(user_id);

-- Grant permissions
GRANT ALL ON membership_tiers TO authenticated, service_role;
GRANT ALL ON user_memberships TO authenticated, service_role;
GRANT ALL ON membership_payments TO authenticated, service_role;

-- Function to check if user has active membership
CREATE OR REPLACE FUNCTION has_active_membership(p_user_id UUID, p_club_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_memberships
        WHERE user_id = p_user_id
        AND club_id = p_club_id
        AND status = 'active'
        AND (end_date IS NULL OR end_date >= CURRENT_DATE)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get membership discount
CREATE OR REPLACE FUNCTION get_membership_discount(p_user_id UUID, p_club_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_discount INTEGER;
BEGIN
    SELECT mt.discount_percentage INTO v_discount
    FROM user_memberships um
    JOIN membership_tiers mt ON um.tier_id = mt.id
    WHERE um.user_id = p_user_id
    AND um.club_id = p_club_id
    AND um.status = 'active'
    AND (um.end_date IS NULL OR um.end_date >= CURRENT_DATE);
    
    RETURN COALESCE(v_discount, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default membership tiers for demo club
INSERT INTO membership_tiers (club_id, name, description, price_monthly, price_yearly, benefits, discount_percentage, priority_booking, max_bookings_per_month, display_order)
VALUES 
(
    '90f93d47-b438-427c-8b33-0597817c1d96',
    'Basic',
    'Perfect for casual players',
    29.99,
    299.99,
    '["10% discount on all bookings", "Priority customer support", "Access to member events"]',
    10,
    false,
    20,
    1
),
(
    '90f93d47-b438-427c-8b33-0597817c1d96',
    'Premium',
    'For regular players',
    49.99,
    499.99,
    '["20% discount on all bookings", "Priority booking (24h advance)", "Free court for birthday", "Access to premium courts", "Unlimited bookings"]',
    20,
    true,
    NULL,
    2
),
(
    '90f93d47-b438-427c-8b33-0597817c1d96',
    'VIP',
    'Ultimate experience',
    99.99,
    999.99,
    '["30% discount on all bookings", "Priority booking (48h advance)", "Free court for birthday + 1 friend", "Access to all courts", "Unlimited bookings", "Personal locker", "Free equipment rental"]',
    30,
    true,
    NULL,
    3
)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE membership_tiers IS 'Membership tier definitions with pricing and benefits';
COMMENT ON TABLE user_memberships IS 'User membership subscriptions';
COMMENT ON TABLE membership_payments IS 'Membership payment history';
