-- Promotions and discount codes system

-- Promotions table
CREATE TABLE IF NOT EXISTS promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL, -- percentage, fixed_amount, free_hour
    discount_value DECIMAL(10,2) NOT NULL,
    min_purchase_amount DECIMAL(10,2),
    max_discount_amount DECIMAL(10,2),
    usage_limit INTEGER, -- NULL for unlimited
    usage_count INTEGER DEFAULT 0,
    usage_per_user INTEGER DEFAULT 1,
    valid_from TIMESTAMPTZ NOT NULL,
    valid_until TIMESTAMPTZ NOT NULL,
    applicable_days INTEGER[], -- Array of day numbers (0=Sunday, 6=Saturday), NULL for all days
    applicable_hours INTEGER[], -- Array of hours (0-23), NULL for all hours
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(club_id, code)
);

-- Promotion usage tracking
CREATE TABLE IF NOT EXISTS promotion_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    promotion_id UUID NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    booking_id UUID REFERENCES bookings(id),
    discount_amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotion_usage ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view active promotions"
    ON promotions FOR SELECT
    USING (is_active = true AND valid_from <= NOW() AND valid_until >= NOW());

CREATE POLICY "Admins can manage promotions"
    ON promotions FOR ALL
    USING (true);

CREATE POLICY "Users can view own usage"
    ON promotion_usage FOR SELECT
    USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_promotions_club ON promotions(club_id);
CREATE INDEX IF NOT EXISTS idx_promotions_code ON promotions(code);
CREATE INDEX IF NOT EXISTS idx_promotions_active ON promotions(is_active);
CREATE INDEX IF NOT EXISTS idx_promotion_usage_promotion ON promotion_usage(promotion_id);
CREATE INDEX IF NOT EXISTS idx_promotion_usage_user ON promotion_usage(user_id);

-- Grant permissions
GRANT ALL ON promotions TO authenticated, service_role;
GRANT ALL ON promotion_usage TO authenticated, service_role;

-- Function to validate and apply promotion
CREATE OR REPLACE FUNCTION apply_promotion(
    p_code VARCHAR,
    p_club_id UUID,
    p_user_id UUID,
    p_booking_amount DECIMAL,
    p_booking_date DATE,
    p_booking_hour INTEGER
)
RETURNS TABLE(
    valid BOOLEAN,
    discount_amount DECIMAL,
    error_message TEXT
) AS $$
DECLARE
    v_promotion RECORD;
    v_usage_count INTEGER;
    v_discount DECIMAL;
BEGIN
    -- Get promotion
    SELECT * INTO v_promotion
    FROM promotions
    WHERE code = p_code
    AND club_id = p_club_id
    AND is_active = true
    AND valid_from <= NOW()
    AND valid_until >= NOW();

    -- Check if promotion exists
    IF v_promotion IS NULL THEN
        RETURN QUERY SELECT false, 0::DECIMAL, 'Invalid or expired promotion code';
        RETURN;
    END IF;

    -- Check usage limit
    IF v_promotion.usage_limit IS NOT NULL AND v_promotion.usage_count >= v_promotion.usage_limit THEN
        RETURN QUERY SELECT false, 0::DECIMAL, 'Promotion usage limit reached';
        RETURN;
    END IF;

    -- Check per-user usage
    SELECT COUNT(*) INTO v_usage_count
    FROM promotion_usage
    WHERE promotion_id = v_promotion.id
    AND user_id = p_user_id;

    IF v_usage_count >= v_promotion.usage_per_user THEN
        RETURN QUERY SELECT false, 0::DECIMAL, 'You have already used this promotion';
        RETURN;
    END IF;

    -- Check minimum purchase
    IF v_promotion.min_purchase_amount IS NOT NULL AND p_booking_amount < v_promotion.min_purchase_amount THEN
        RETURN QUERY SELECT false, 0::DECIMAL, 'Minimum purchase amount not met';
        RETURN;
    END IF;

    -- Check applicable days
    IF v_promotion.applicable_days IS NOT NULL THEN
        IF NOT (EXTRACT(DOW FROM p_booking_date)::INTEGER = ANY(v_promotion.applicable_days)) THEN
            RETURN QUERY SELECT false, 0::DECIMAL, 'Promotion not valid on this day';
            RETURN;
        END IF;
    END IF;

    -- Check applicable hours
    IF v_promotion.applicable_hours IS NOT NULL THEN
        IF NOT (p_booking_hour = ANY(v_promotion.applicable_hours)) THEN
            RETURN QUERY SELECT false, 0::DECIMAL, 'Promotion not valid at this time';
            RETURN;
        END IF;
    END IF;

    -- Calculate discount
    IF v_promotion.discount_type = 'percentage' THEN
        v_discount := p_booking_amount * (v_promotion.discount_value / 100);
    ELSIF v_promotion.discount_type = 'fixed_amount' THEN
        v_discount := v_promotion.discount_value;
    ELSE
        v_discount := 0;
    END IF;

    -- Apply max discount cap
    IF v_promotion.max_discount_amount IS NOT NULL THEN
        v_discount := LEAST(v_discount, v_promotion.max_discount_amount);
    END IF;

    -- Ensure discount doesn't exceed booking amount
    v_discount := LEAST(v_discount, p_booking_amount);

    RETURN QUERY SELECT true, v_discount, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert demo promotions
INSERT INTO promotions (club_id, code, name, description, discount_type, discount_value, valid_from, valid_until, usage_limit)
VALUES 
(
    '90f93d47-b438-427c-8b33-0597817c1d96',
    'WELCOME10',
    'Welcome Discount',
    'Get 10% off your first booking',
    'percentage',
    10,
    NOW(),
    NOW() + INTERVAL '1 year',
    NULL
),
(
    '90f93d47-b438-427c-8b33-0597817c1d96',
    'WEEKEND25',
    'Weekend Special',
    '25% off weekend bookings',
    'percentage',
    25,
    NOW(),
    NOW() + INTERVAL '3 months',
    NULL
),
(
    '90f93d47-b438-427c-8b33-0597817c1d96',
    'EARLYBIRD',
    'Early Bird Discount',
    '€5 off morning bookings (6-10 AM)',
    'fixed_amount',
    5,
    NOW(),
    NOW() + INTERVAL '6 months',
    NULL
),
(
    '90f93d47-b438-427c-8b33-0597817c1d96',
    'FLASH50',
    'Flash Sale',
    '50% off - Limited to 100 uses!',
    'percentage',
    50,
    NOW(),
    NOW() + INTERVAL '7 days',
    100
)
ON CONFLICT DO NOTHING;

-- Update weekend promotion to only apply on weekends
UPDATE promotions
SET applicable_days = ARRAY[0, 6]  -- Sunday and Saturday
WHERE code = 'WEEKEND25';

-- Update early bird to only apply in morning hours
UPDATE promotions
SET applicable_hours = ARRAY[6, 7, 8, 9]
WHERE code = 'EARLYBIRD';

COMMENT ON TABLE promotions IS 'Promotional discount codes with validation rules';
COMMENT ON TABLE promotion_usage IS 'Tracking of promotion code usage';
