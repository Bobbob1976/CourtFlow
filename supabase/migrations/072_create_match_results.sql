-- Create match_results table
CREATE TABLE IF NOT EXISTS public.match_results (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id uuid REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL UNIQUE,
    created_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES auth.users(id),
    
    -- Sets scores (up to 3 sets usually)
    set1_team1 int,
    set1_team2 int,
    set2_team1 int,
    set2_team2 int,
    set3_team1 int,
    set3_team2 int,
    
    winner_team text CHECK (winner_team IN ('team1', 'team2', 'draw'))
);

-- RLS
ALTER TABLE public.match_results ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read results (social feature)
CREATE POLICY "Public read results" ON public.match_results
    FOR SELECT USING (true);

-- Policy: Participants can create results
-- Creating a simplified policy: Authenticated users can create results for any booking they are the owner of.
CREATE POLICY "Owners can add results" ON public.match_results
    FOR INSERT WITH CHECK (
        auth.uid() IN (SELECT user_id FROM public.bookings WHERE id = booking_id)
    );
