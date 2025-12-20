-- CONNECTION CHECK SCRIPT (024)
-- This script inserts a unique "Marker" club to verify we are on the same database.

DO $$
BEGIN
    INSERT INTO clubs (name, subdomain, brand_color, subscription_tier)
    VALUES ('VERIFICATION_MARKER_CLUB', 'verify-db-' || gen_random_uuid(), '#FF00FF', 'free');

    RAISE NOTICE 'Marker Club Inserted. Check your App logs for VERIFICATION_MARKER_CLUB.';
END$$;
