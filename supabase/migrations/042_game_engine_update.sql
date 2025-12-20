-- Migration 042: Update Game Engine Schema based on approved design

-- 1. Update player_ratings to use DECIMAL and 2.50 scale
-- We drop and recreate to ensure clean state if 041 was run, or create if not.
DROP TABLE IF EXISTS player_ratings;
CREATE TABLE player_ratings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id),
    current_rating DECIMAL(10, 2) DEFAULT 2.50,
    k_factor INT DEFAULT 50,
    matches_played INT DEFAULT 0,
    last_active TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Update matches table if needed (ensure columns exist)
CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id),
    date TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'pending_validation',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create match_results (Denormalized as requested)
-- Dropping match_sets from 041 if it exists to avoid confusion
DROP TABLE IF EXISTS match_sets;

CREATE TABLE IF NOT EXISTS match_results (
    match_id UUID PRIMARY KEY REFERENCES matches(id),
    -- Team 1
    team_1_p1 UUID REFERENCES auth.users(id),
    team_1_p2 UUID REFERENCES auth.users(id),
    -- Team 2
    team_2_p1 UUID REFERENCES auth.users(id),
    team_2_p2 UUID REFERENCES auth.users(id),
    -- Scores
    score_set1_t1 INT, score_set1_t2 INT,
    score_set2_t1 INT, score_set2_t2 INT,
    score_set3_t1 INT, score_set3_t2 INT,
    -- Outcome
    winner_team INT, -- 1 or 2
    total_games_t1 INT,
    total_games_t2 INT
);

-- 4. Create rating_history
CREATE TABLE IF NOT EXISTS rating_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    match_id UUID REFERENCES matches(id),
    old_rating DECIMAL(10, 2),
    new_rating DECIMAL(10, 2),
    change_amount DECIMAL(10, 2),
    date TIMESTAMPTZ DEFAULT NOW()
);
