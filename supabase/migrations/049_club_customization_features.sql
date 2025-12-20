-- Migration: Club Customization & Enhanced Features
-- Adds support for club branding, custom colors, and extended user stats

-- ============================================================================
-- CLUB CUSTOMIZATION
-- ============================================================================

-- Add customization columns to clubs table
ALTER TABLE public.clubs 
ADD COLUMN IF NOT EXISTS custom_logo_url TEXT,
ADD COLUMN IF NOT EXISTS custom_banner_url TEXT,
ADD COLUMN IF NOT EXISTS primary_color VARCHAR(7) DEFAULT '#00d084',
ADD COLUMN IF NOT EXISTS secondary_color VARCHAR(7) DEFAULT '#ff6b35',
ADD COLUMN IF NOT EXISTS welcome_message TEXT DEFAULT 'Welkom! Boek je baan en speel.',
ADD COLUMN IF NOT EXISTS gallery_images JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS theme_mode VARCHAR(20) DEFAULT 'default' CHECK (theme_mode IN ('default', 'vibrant', 'minimal', 'professional'));

-- Add club features toggle
ALTER TABLE public.clubs
ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '{
  "weather_widget": true,
  "achievements": true,
  "social_feed": true,
  "partner_suggestions": true,
  "live_status": true
}'::jsonb;

-- ============================================================================
-- EXTENDED USER STATS
-- ============================================================================

-- Create user_stats table for enhanced tracking
CREATE TABLE IF NOT EXISTS public.user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Streak tracking
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_played_date DATE,
  
  -- Play statistics
  total_bookings INTEGER DEFAULT 0,
  total_matches INTEGER DEFAULT 0,
  total_wins INTEGER DEFAULT 0,
  total_losses INTEGER DEFAULT 0,
  
  -- Preferences
  favorite_court_id UUID REFERENCES public.courts(id),
  favorite_time_slot VARCHAR(5), -- e.g. "18:00"
  preferred_partners UUID[] DEFAULT ARRAY[]::UUID[],
  
  -- Achievements
  badges JSONB DEFAULT '[]'::jsonb,
  points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON public.user_stats(user_id);

-- Enable RLS
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own stats"
  ON public.user_stats FOR SELECT
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own stats"
  ON public.user_stats FOR UPDATE
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert their own stats"
  ON public.user_stats FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

-- ============================================================================
-- COURT STATUS TRACKING
-- ============================================================================

-- Add real-time status to courts
ALTER TABLE public.courts
ADD COLUMN IF NOT EXISTS current_status VARCHAR(20) DEFAULT 'available' 
  CHECK (current_status IN ('available', 'occupied', 'maintenance', 'reserved')),
ADD COLUMN IF NOT EXISTS status_updated_at TIMESTAMPTZ DEFAULT NOW();

-- ============================================================================
-- PARTNER SUGGESTIONS
-- ============================================================================

-- Create partner connections table
CREATE TABLE IF NOT EXISTS public.partner_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Connection stats
  times_played_together INTEGER DEFAULT 0,
  last_played_together TIMESTAMPTZ,
  
  -- Status
  status VARCHAR(20) DEFAULT 'connected' CHECK (status IN ('connected', 'favorite', 'blocked')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, partner_id)
);

-- Enable RLS
ALTER TABLE public.partner_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their connections"
  ON public.partner_connections FOR SELECT
  USING (user_id = (SELECT auth.uid()) OR partner_id = (SELECT auth.uid()));

CREATE POLICY "Users can manage their connections"
  ON public.partner_connections FOR ALL
  USING (user_id = (SELECT auth.uid()));

-- ============================================================================
-- CHALLENGES SYSTEM
-- ============================================================================

-- Create challenges table
CREATE TABLE IF NOT EXISTS public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenger_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenged_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  
  -- Challenge details
  message TEXT,
  proposed_time TIMESTAMPTZ,
  court_id UUID REFERENCES public.courts(id),
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'completed')),
  
  -- Results (if completed)
  winner_id UUID REFERENCES auth.users(id),
  score VARCHAR(50),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view challenges involving them"
  ON public.challenges FOR SELECT
  USING (challenger_id = (SELECT auth.uid()) OR challenged_id = (SELECT auth.uid()));

CREATE POLICY "Users can create challenges"
  ON public.challenges FOR INSERT
  WITH CHECK (challenger_id = (SELECT auth.uid()));

CREATE POLICY "Users can update their challenges"
  ON public.challenges FOR UPDATE
  USING (challenger_id = (SELECT auth.uid()) OR challenged_id = (SELECT auth.uid()));

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to update user streak
CREATE OR REPLACE FUNCTION update_user_streak(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_last_played DATE;
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
BEGIN
  SELECT last_played_date, current_streak, longest_streak
  INTO v_last_played, v_current_streak, v_longest_streak
  FROM public.user_stats
  WHERE user_id = p_user_id;
  
  -- If played yesterday, increment streak
  IF v_last_played = CURRENT_DATE - INTERVAL '1 day' THEN
    v_current_streak := v_current_streak + 1;
  -- If played today, keep streak
  ELSIF v_last_played = CURRENT_DATE THEN
    -- Do nothing
    RETURN;
  -- If gap, reset streak
  ELSE
    v_current_streak := 1;
  END IF;
  
  -- Update longest streak if needed
  IF v_current_streak > v_longest_streak THEN
    v_longest_streak := v_current_streak;
  END IF;
  
  UPDATE public.user_stats
  SET 
    current_streak = v_current_streak,
    longest_streak = v_longest_streak,
    last_played_date = CURRENT_DATE,
    updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION update_user_streak(UUID) TO authenticated;

-- Success message
DO $$ 
BEGIN
  RAISE NOTICE 'Club customization and enhanced features enabled!';
  RAISE NOTICE '- Club branding (logo, colors, banner)';
  RAISE NOTICE '- User stats tracking (streaks, wins, preferences)';
  RAISE NOTICE '- Partner connections';
  RAISE NOTICE '- Challenges system';
  RAISE NOTICE '- Court status tracking';
END $$;
