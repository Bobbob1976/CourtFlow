-- Allow authenticated users to INSERT bookings (for themselves)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE tablename = 'bookings' 
        AND policyname = 'Authenticated users can create bookings'
    ) THEN
        CREATE POLICY "Authenticated users can create bookings"
        ON bookings
        FOR INSERT
        TO authenticated
        WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- Allow authenticated users to SELECT their own bookings (if not already there)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE tablename = 'bookings' 
        AND policyname = 'Users can view own bookings'
    ) THEN
        CREATE POLICY "Users can view own bookings"
        ON bookings
        FOR SELECT
        TO authenticated
        USING (auth.uid() = user_id);
    END IF;
END $$;
