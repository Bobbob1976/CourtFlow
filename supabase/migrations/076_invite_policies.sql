-- Allow users to see not-yet-linked invites sent to their email
CREATE POLICY "View invites by email" ON public.booking_participants
FOR SELECT
USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Allow users to accept/decline invites sent to their email
CREATE POLICY "Update invites by email" ON public.booking_participants
FOR UPDATE
USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
);
