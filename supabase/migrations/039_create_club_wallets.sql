-- Create club_wallets table for wallet functionality

CREATE TABLE IF NOT EXISTS club_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    balance DECIMAL(10,2) DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, club_id)
);

-- Enable RLS
ALTER TABLE club_wallets ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own wallets
CREATE POLICY "Users can view own wallet"
    ON club_wallets
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can update their own wallets
CREATE POLICY "Users can update own wallet"
    ON club_wallets
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy: System can insert wallets
CREATE POLICY "System can insert wallets"
    ON club_wallets
    FOR INSERT
    WITH CHECK (true);

-- Grant permissions
GRANT ALL ON club_wallets TO authenticated;
GRANT ALL ON club_wallets TO service_role;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_club_wallets_user_club 
    ON club_wallets(user_id, club_id);

-- Verify
SELECT * FROM club_wallets LIMIT 5;
