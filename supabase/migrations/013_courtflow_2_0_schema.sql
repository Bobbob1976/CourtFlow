-- PHASE 2: CourtFlow 2.0 - Architecture Upgrade
-- Supports: Multi-sport, Subscriptions, Open Matches

-- 1. ENUMS
-- Check if types exist before creating to avoid errors on re-run
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sport_type') THEN
        CREATE TYPE sport_type AS ENUM ('padel', 'tennis', 'squash');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'match_type') THEN
        CREATE TYPE match_type AS ENUM ('competitive', 'friendly', 'training');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_tier_type') THEN
        CREATE TYPE subscription_tier_type AS ENUM ('free', 'premium', 'unlimited');
    END IF;
END$$;

-- 2. UPDATE COURTS (Scalability)
ALTER TABLE courts 
ADD COLUMN IF NOT EXISTS sport sport_type NOT NULL DEFAULT 'padel',
ADD COLUMN IF NOT EXISTS is_double BOOLEAN DEFAULT true;

-- 3. UPDATE USER_PROFILES (Gamification & Monetization)
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS current_level DECIMAL(3,1) DEFAULT 3.0,
ADD COLUMN IF NOT EXISTS subscription_tier subscription_tier_type DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS preferred_hand VARCHAR(10),
ADD COLUMN IF NOT EXISTS matches_played INT DEFAULT 0;

-- 4. SUBSCRIPTIONS TABLE (Monetization)
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    plan_id VARCHAR(255) NOT NULL, -- Stripe Price ID
    status VARCHAR(50) NOT NULL, -- 'active', 'canceled', 'past_due'
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    renews_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for Subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription" ON subscriptions
    FOR SELECT USING (user_id = auth.uid());

-- 5. OPEN MATCHES (Community)
CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    host_id UUID NOT NULL REFERENCES user_profiles(id),
    club_id UUID NOT NULL REFERENCES clubs(id), -- Denormalized for easier querying
    min_level DECIMAL(3,1),
    max_level DECIMAL(3,1),
    match_type match_type DEFAULT 'friendly',
    looking_for_players INT DEFAULT 3, -- Default for Padel (4 players total, 1 host)
    is_public BOOLEAN DEFAULT true,
    status VARCHAR(20) DEFAULT 'open', -- 'open', 'full', 'finished', 'cancelled'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for Matches
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public matches" ON matches
    FOR SELECT USING (is_public = true OR host_id = auth.uid());

CREATE POLICY "Users can create matches" ON matches
    FOR INSERT WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Host can update match" ON matches
    FOR UPDATE USING (auth.uid() = host_id);

-- 6. MATCH PLAYERS (Participants)
CREATE TABLE IF NOT EXISTS match_players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id),
    team INT DEFAULT 1, -- 1 or 2
    status VARCHAR(20) DEFAULT 'confirmed', -- 'confirmed', 'pending_payment'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(match_id, user_id)
);

-- RLS for Match Players
ALTER TABLE match_players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view match players" ON match_players
    FOR SELECT USING (true);

CREATE POLICY "Users can join matches" ON match_players
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 7. INDEXES
CREATE INDEX IF NOT EXISTS idx_matches_club_status ON matches(club_id, status);
CREATE INDEX IF NOT EXISTS idx_matches_level ON matches(min_level, max_level);
CREATE INDEX IF NOT EXISTS idx_courts_sport ON courts(sport);

-- 8. TRIGGER FOR UPDATED_AT
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
