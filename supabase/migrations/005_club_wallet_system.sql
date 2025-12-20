-- PHASE 2: Fintech Feature - Closed-Loop Club Wallet
-- Database migration for creating a per-club wallet and transaction ledger.

-- =============================================================================
-- CLUB_WALLETS TABLE
-- Stores the balance for each user at each club.
-- =============================================================================

CREATE TABLE club_wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    balance DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- A user can only have one wallet per club.
    CONSTRAINT unique_wallet_per_club_user UNIQUE (club_id, user_id),
    -- Balance cannot be negative.
    CONSTRAINT non_negative_balance CHECK (balance >= 0)
);

-- Indexes for performance
CREATE INDEX idx_club_wallets_club_id ON club_wallets(club_id);
CREATE INDEX idx_club_wallets_user_id ON club_wallets(user_id);

-- RLS Policies for club_wallets
ALTER TABLE club_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own wallet" ON club_wallets
    FOR SELECT USING (auth.uid() = user_id);

-- No insert/update/delete policies for users directly. All mutations must go through RPC functions.

CREATE POLICY "Service role can manage all wallets" ON club_wallets
    FOR ALL USING (auth.role() = 'service_role');

-- =============================================================================
-- WALLET_TRANSACTIONS TABLE
-- An immutable ledger of all transactions for all wallets.
-- =============================================================================

CREATE TYPE transaction_type AS ENUM ('topup', 'payment', 'refund', 'bonus', 'correction');

CREATE TABLE wallet_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID NOT NULL REFERENCES club_wallets(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL, -- Positive for top-ups/refunds, negative for payments.
    type transaction_type NOT NULL,
    reference_id TEXT, -- e.g., booking_id or stripe_payment_intent_id
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_wallet_transactions_wallet_id ON wallet_transactions(wallet_id);
CREATE INDEX idx_wallet_transactions_type ON wallet_transactions(type);

-- RLS Policies for wallet_transactions
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions" ON wallet_transactions
    FOR SELECT USING (
        wallet_id IN (SELECT id FROM club_wallets WHERE user_id = auth.uid())
    );

CREATE POLICY "Service role can manage all transactions" ON wallet_transactions
    FOR ALL USING (auth.role() = 'service_role');


-- =============================================================================
-- RPC FUNCTION FOR ATOMIC TOP-UP
-- This ensures the wallet is created/updated and a transaction is logged in one go.
-- =============================================================================

CREATE OR REPLACE FUNCTION process_wallet_topup(
    p_user_id UUID,
    p_club_id UUID,
    p_amount DECIMAL,
    p_payment_intent_id TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_wallet_id UUID;
BEGIN
    -- Find or create the wallet for the user and club
    INSERT INTO club_wallets (user_id, club_id, balance)
    VALUES (p_user_id, p_club_id, p_amount)
    ON CONFLICT (user_id, club_id)
    DO UPDATE SET
        balance = club_wallets.balance + p_amount,
        updated_at = NOW()
    RETURNING id INTO v_wallet_id;

    -- If the wallet was just created, the RETURNING clause will populate v_wallet_id.
    -- If it was updated, we need to fetch the id.
    IF v_wallet_id IS NULL THEN
        SELECT id INTO v_wallet_id FROM club_wallets WHERE user_id = p_user_id AND club_id = p_club_id;
    END IF;

    -- Log the transaction in the ledger
    INSERT INTO wallet_transactions (wallet_id, amount, type, reference_id, description)
    VALUES (
        v_wallet_id,
        p_amount,
        'topup',
        p_payment_intent_id,
        'Tegoed opgewaardeerd via Stripe'
    );
END;
$$;

-- Grant execution to the service_role, as this will be called from a webhook
GRANT EXECUTE ON FUNCTION process_wallet_topup(UUID, UUID, DECIMAL, TEXT) TO service_role;


-- =============================================================================
-- RPC FUNCTION FOR ATOMIC PAYMENT
-- Atomically checks balance, deducts amount, logs transaction, and updates booking.
-- =============================================================================

CREATE OR REPLACE FUNCTION process_wallet_payment(
    p_user_id UUID,
    p_booking_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_wallet_id UUID;
    v_current_balance DECIMAL;
    v_booking_cost DECIMAL;
    v_club_id UUID;
BEGIN
    -- Get booking cost and club_id
    SELECT total_cost, club_id INTO v_booking_cost, v_club_id FROM bookings WHERE id = p_booking_id;

    -- Get the user's wallet for this specific club
    SELECT id, balance INTO v_wallet_id, v_current_balance FROM club_wallets WHERE user_id = p_user_id AND club_id = v_club_id;

    -- Check for sufficient funds
    IF v_wallet_id IS NULL OR v_current_balance < v_booking_cost THEN
        RETURN json_build_object('success', false, 'error', 'Onvoldoende saldo');
    END IF;

    -- 1. Deduct from wallet
    UPDATE club_wallets SET balance = balance - v_booking_cost, updated_at = NOW() WHERE id = v_wallet_id;

    -- 2. Log the transaction
    INSERT INTO wallet_transactions (wallet_id, amount, type, reference_id, description)
    VALUES (v_wallet_id, -v_booking_cost, 'payment', p_booking_id::text, 'Betaling voor boeking ' || p_booking_id::text);

    -- 3. Update the booking
    UPDATE bookings SET status = 'confirmed', payment_status = 'paid', payment_method = 'wallet' WHERE id = p_booking_id;

    RETURN json_build_object('success', true, 'message', 'Betaling succesvol');
END;
$$;

-- Grant execution to authenticated users, as they will trigger this
GRANT EXECUTE ON FUNCTION process_wallet_payment(UUID, UUID) TO authenticated;