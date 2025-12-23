-- Drop the old potentially broken policies
DROP POLICY IF EXISTS "View invites by email" ON public.booking_participants;
DROP POLICY IF EXISTS "Update invites by email" ON public.booking_participants;

-- Re-create with robust JWT email check
CREATE POLICY "View invites by email" ON public.booking_participants
FOR SELECT
USING (
  email = (auth.jwt() ->> 'email')
);

CREATE POLICY "Update invites by email" ON public.booking_participants
FOR UPDATE
USING (
  email = (auth.jwt() ->> 'email')
);

-- Delete policy (for declining)
CREATE POLICY "Delete invites by email" ON public.booking_participants
FOR DELETE
USING (
  email = (auth.jwt() ->> 'email')
);
