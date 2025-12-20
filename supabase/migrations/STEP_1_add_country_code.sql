-- ============================================================================
-- STEP 1: Run this FIRST (adds country_code column)
-- ============================================================================

-- Add country_code column to clubs table
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS country_code VARCHAR(2) DEFAULT 'NL';

-- Add comment
COMMENT ON COLUMN clubs.country_code IS 'ISO 3166-1 alpha-2 country code for tax calculations';

-- Update existing clubs
UPDATE clubs SET country_code = 'NL' WHERE country_code IS NULL;

-- Create index
CREATE INDEX IF NOT EXISTS idx_clubs_country_code ON clubs(country_code);

-- Verify it worked
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'clubs' AND column_name = 'country_code';
