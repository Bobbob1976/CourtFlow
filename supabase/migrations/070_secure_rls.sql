-- 1. Enable RLS on tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------
-- USER PROFILES POLICIES
-- ---------------------------------------------------------

-- Reset existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;

-- Policy: Authenticated users can read ALL profiles (Needed for social features & admin dash)
CREATE POLICY "Authenticated users can read all profiles"
ON public.user_profiles FOR SELECT
TO authenticated
USING (true);

-- Policy: Users can update ONLY their own profile
CREATE POLICY "Users can update own profile"
ON public.user_profiles FOR UPDATE
USING (auth.uid() = id);

-- Policy: Users can insert their own profile (if not created by trigger)
CREATE POLICY "Users can insert own profile"
ON public.user_profiles FOR INSERT
WITH CHECK (auth.uid() = id);


-- ---------------------------------------------------------
-- BOOKINGS POLICIES
-- ---------------------------------------------------------

DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can manage all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can insert bookings" ON public.bookings;

-- Policy: Users can view their OWN bookings OR if they are Admin
CREATE POLICY "View bookings policy"
ON public.bookings FOR SELECT
TO authenticated
USING (
    auth.uid() = user_id 
    OR 
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'club_owner')
    )
);

-- Policy: Admins can update/delete any booking
CREATE POLICY "Admins can manage bookings"
ON public.bookings FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'club_owner')
    )
);

-- Policy: Users can create bookings for themselves
CREATE POLICY "Users can create bookings"
ON public.bookings FOR INSERT
WITH CHECK (auth.uid() = user_id);
