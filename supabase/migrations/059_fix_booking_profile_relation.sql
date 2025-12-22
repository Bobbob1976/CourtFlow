-- Add foreign key relationship if it doesn't exist
-- This allows Supabase query join: bookings.select('*, user_profiles(*)')

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'bookings_user_id_fkey_profiles'
    ) THEN
        ALTER TABLE bookings
        ADD CONSTRAINT bookings_user_id_fkey_profiles
        FOREIGN KEY (user_id)
        REFERENCES user_profiles(id)
        ON DELETE SET NULL;
    END IF;
END $$;
