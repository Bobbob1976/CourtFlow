-- PHASE 2: Growth Features - Credit Wallet Function
-- Creates an RPC function to credit a user's wallet.

CREATE OR REPLACE FUNCTION credit_wallet(
    p_user_id UUID,
    p_club_id UUID,
    p_amount DECIMAL,
    p_reason TEXT,
    p_reference_id TEXT
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
        'refund',
        p_reference_id,
        p_reason
    );
END;
$$;

-- Grant execution to the service_role, as this will be called from a server process
GRANT EXECUTE ON FUNCTION credit_wallet(UUID, UUID, DECIMAL, TEXT, TEXT) TO service_role;
