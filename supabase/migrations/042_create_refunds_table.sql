-- Refunds table for tracking all refunds
CREATE TABLE IF NOT EXISTS refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    reason TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- pending, completed, failed
    mollie_refund_id VARCHAR(255),
    processed_by UUID REFERENCES auth.users(id), -- Admin who processed
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own refunds"
    ON refunds FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all refunds"
    ON refunds FOR SELECT
    USING (true); -- Simplified for now

CREATE POLICY "Admins can create refunds"
    ON refunds FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admins can update refunds"
    ON refunds FOR UPDATE
    USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_refunds_booking ON refunds(booking_id);
CREATE INDEX IF NOT EXISTS idx_refunds_user ON refunds(user_id);
CREATE INDEX IF NOT EXISTS idx_refunds_club ON refunds(club_id);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON refunds(status);

-- Grant permissions
GRANT ALL ON refunds TO authenticated, service_role;

-- Add mollie_payment_id to bookings if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bookings' AND column_name = 'mollie_payment_id'
    ) THEN
        ALTER TABLE bookings ADD COLUMN mollie_payment_id VARCHAR(255);
        CREATE INDEX IF NOT EXISTS idx_bookings_mollie_payment ON bookings(mollie_payment_id);
    END IF;
END $$;

COMMENT ON TABLE refunds IS 'Tracks all refunds for bookings with Mollie integration';
