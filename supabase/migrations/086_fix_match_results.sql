-- 1. Ensure table exists with correct structure
CREATE TABLE IF NOT EXISTS public.match_results (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id uuid REFERENCES public.bookings(id) ON DELETE CASCADE,
    created_by uuid REFERENCES auth.users(id),
    set1_team1 integer DEFAULT 0,
    set1_team2 integer DEFAULT 0,
    set2_team1 integer DEFAULT 0,
    set2_team2 integer DEFAULT 0,
    set3_team1 integer DEFAULT 0,
    set3_team2 integer DEFAULT 0,
    winner_team text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 2. IMPORTANT: Ensure booking_id is UNIQUE so upsert works!
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'match_results_booking_id_key'
    ) THEN
        ALTER TABLE public.match_results ADD CONSTRAINT match_results_booking_id_key UNIQUE (booking_id);
    END IF;
END
$$;

-- 3. Enable RLS
ALTER TABLE public.match_results ENABLE ROW LEVEL SECURITY;

-- 4. Fix Policies (Allow INSERT/UPDATE for participants)
-- For now, allow logged in users to insert matches if they can see the booking
DROP POLICY IF EXISTS "Users can insert match results" ON public.match_results;
CREATE POLICY "Users can insert match results" ON public.match_results
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update match results" ON public.match_results;
CREATE POLICY "Users can update match results" ON public.match_results
FOR UPDATE
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can read match results" ON public.match_results;
CREATE POLICY "Users can read match results" ON public.match_results
FOR SELECT
USING (true);
