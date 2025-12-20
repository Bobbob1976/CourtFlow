-- PHASE 2: CourtFlow 2.0 - Architecture Upgrade (Robust Version)
-- Handles missing user_profiles and applies 2.0 schema

-- 1. ENSURE USER_PROFILES EXISTS (Fix for missing table)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    club_id UUID REFERENCES clubs(id) ON DELETE SET NULL,
    email VARCHAR(255),
    full_name VARCHAR(255),
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL DEFAULT 'member',
    membership_status VARCHAR(20) NOT NULL DEFAULT 'active',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS if created
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Backfill user_profiles from auth.users if empty/missing
INSERT INTO public.user_profiles (id, email)
SELECT id, email FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 2. ENUMS
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

-- 3. UPDATE COURTS (Scalability)
ALTER TABLE courts 
ADD COLUMN IF NOT EXISTS sport sport_type NOT NULL DEFAULT 'padel',
ADD COLUMN IF NOT EXISTS is_double BOOLEAN DEFAULT true;

-- 4. UPDATE USER_PROFILES (Gamification & Monetization)
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS current_level DECIMAL(3,1) DEFAULT 3.0,
ADD COLUMN IF NOT EXISTS subscription_tier subscription_tier_type DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS preferred_hand VARCHAR(10),
ADD COLUMN IF NOT EXISTS matches_played INT DEFAULT 0;

-- 5. SUBSCRIPTIONS TABLE (Monetization)
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    plan_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    renews_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subscriptions' AND policyname = 'Users can view own subscription') THEN
        CREATE POLICY "Users can view own subscription" ON subscriptions FOR SELECT USING (user_id = auth.uid());
    END IF;
END$$;

-- 6. OPEN MATCHES (Community)
CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    host_id UUID NOT NULL REFERENCES user_profiles(id),
    club_id UUID NOT NULL REFERENCES clubs(id),
    min_level DECIMAL(3,1),
    max_level DECIMAL(3,1),
    match_type match_type DEFAULT 'friendly',
    looking_for_players INT DEFAULT 3,
    is_public BOOLEAN DEFAULT true,
    status VARCHAR(20) DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'matches' AND policyname = 'Anyone can view public matches') THEN
        CREATE POLICY "Anyone can view public matches" ON matches FOR SELECT USING (is_public = true OR host_id = auth.uid());
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'matches' AND policyname = 'Users can create matches') THEN
        CREATE POLICY "Users can create matches" ON matches FOR INSERT WITH CHECK (auth.uid() = host_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'matches' AND policyname = 'Host can update match') THEN
        CREATE POLICY "Host can update match" ON matches FOR UPDATE USING (auth.uid() = host_id);
    END IF;
END$$;

-- 7. MATCH PLAYERS (Participants)
CREATE TABLE IF NOT EXISTS match_players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id),
    team INT DEFAULT 1,
    status VARCHAR(20) DEFAULT 'confirmed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(match_id, user_id)
);

ALTER TABLE match_players ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'match_players' AND policyname = 'Anyone can view match players') THEN
        CREATE POLICY "Anyone can view match players" ON match_players FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'match_players' AND policyname = 'Users can join matches') THEN
        CREATE POLICY "Users can join matches" ON match_players FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END$$;

-- 8. INDEXES
CREATE INDEX IF NOT EXISTS idx_matches_club_status ON matches(club_id, status);
CREATE INDEX IF NOT EXISTS idx_matches_level ON matches(min_level, max_level);
CREATE INDEX IF NOT EXISTS idx_courts_sport ON courts(sport);

-- 9. TRIGGERS
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_matches_updated_at ON matches;
CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
