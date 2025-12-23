-- 1. Relaxed Case-Insensitive Policies (Fixes permission issues with different casing)
DROP POLICY IF EXISTS "View invites by email" ON public.booking_participants;
DROP POLICY IF EXISTS "Update invites by email" ON public.booking_participants;
DROP POLICY IF EXISTS "Delete invites by email" ON public.booking_participants;

CREATE POLICY "View invites by email" ON public.booking_participants
FOR SELECT
USING (
  lower(email) = lower(auth.jwt() ->> 'email')
);

CREATE POLICY "Update invites by email" ON public.booking_participants
FOR UPDATE
USING (
  lower(email) = lower(auth.jwt() ->> 'email')
);

CREATE POLICY "Delete invites by email" ON public.booking_participants
FOR DELETE
USING (
  lower(email) = lower(auth.jwt() ->> 'email')
);

-- 2. Aggressive Cleanup (Case Insensitive)
-- This removes ALL duplicates, ignoring case differences (e.g. Test@mail.com vs test@mail.com)
DELETE FROM booking_participants a
USING booking_participants b
WHERE a.id > b.id 
AND a.booking_id = b.booking_id 
AND lower(a.email) = lower(b.email);
