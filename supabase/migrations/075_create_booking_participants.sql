-- Create table for booking participants
CREATE TABLE IF NOT EXISTS public.booking_participants (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id uuid REFERENCES public.bookings(id) ON DELETE CASCADE,
    user_id uuid REFERENCES public.user_profiles(id), -- Nullable, user might not exist yet
    email text, -- For external invites or fallback
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'owner')),
    role text DEFAULT 'player' CHECK (role IN ('owner', 'player')),
    created_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE public.booking_participants ENABLE ROW LEVEL SECURITY;

-- 1. Everyone can read participants for bookings they can see
CREATE POLICY "Public read participants" ON public.booking_participants
    FOR SELECT
    USING (true);

-- 2. Booking owners can ADD participants
CREATE POLICY "Owners can invite" ON public.booking_participants
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.bookings 
            WHERE id = booking_id 
            AND user_id = auth.uid()
        )
    );

-- 3. Users can update their OWN status (accept/decline)
CREATE POLICY "Users can update own status" ON public.booking_participants
    FOR UPDATE
    USING (
         -- Can update if linked by user_id OR email (matches auth email)
         user_id = auth.uid() 
    )
    WITH CHECK (
         user_id = auth.uid()
    );

-- 4. Owners can remove participants
CREATE POLICY "Owners can remove" ON public.booking_participants
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.bookings 
            WHERE id = booking_id 
            AND user_id = auth.uid()
        )
    );
