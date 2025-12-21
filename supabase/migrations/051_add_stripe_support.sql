-- Migration: Add Stripe Support (Dual Payment Providers)
-- Extends clubs table to support both Mollie AND Stripe

-- Add payment provider preference to clubs
ALTER TABLE clubs 
ADD COLUMN IF NOT EXISTS payment_provider TEXT DEFAULT 'mollie' CHECK (payment_provider IN ('mollie', 'stripe', 'both'));

ALTER TABLE clubs
ADD COLUMN IF NOT EXISTS stripe_account_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_publishable_key TEXT,
ADD COLUMN IF NOT EXISTS stripe_secret_key TEXT;

-- Add payment provider tracking to bookings
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS payment_provider TEXT CHECK (payment_provider IN ('mollie', 'stripe'));

-- Add Stripe payment intent ID
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;

COMMENT ON COLUMN clubs.payment_provider IS 'Preferred payment provider: mollie, stripe, or both';
COMMENT ON COLUMN bookings.payment_provider IS 'Which provider was used for this booking';
COMMENT ON COLUMN bookings.stripe_payment_intent_id IS 'Stripe Payment Intent ID for tracking';

-- Create index for faster payment lookups
CREATE INDEX IF NOT EXISTS idx_bookings_stripe_intent ON bookings(stripe_payment_intent_id);

DO $$ 
BEGIN
  RAISE NOTICE '✓ Stripe support added!';
  RAISE NOTICE '✓ Clubs can now accept both Mollie and Stripe payments';
  RAISE NOTICE '✓ Set club payment_provider to: mollie, stripe, or both';
END $$;
