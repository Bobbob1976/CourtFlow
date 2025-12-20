-- Migration: Add country_code to clubs table for international tax support
-- This enables automatic VAT/tax calculation per country

-- Add country_code column to clubs table
ALTER TABLE clubs 
ADD COLUMN IF NOT EXISTS country_code VARCHAR(2) DEFAULT 'NL' CHECK (country_code ~ '^[A-Z]{2}$');

-- Add comment for documentation
COMMENT ON COLUMN clubs.country_code IS 'ISO 3166-1 alpha-2 country code for tax calculations (NL, BE, DE, FR, ES, UK, US, etc.)';

-- Update existing clubs to NL (Nederland) as default
UPDATE clubs 
SET country_code = 'NL' 
WHERE country_code IS NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_clubs_country_code ON clubs(country_code);

-- Add validation function to ensure country code is supported
CREATE OR REPLACE FUNCTION validate_country_code()
RETURNS TRIGGER AS $$
DECLARE
    supported_countries TEXT[] := ARRAY['NL', 'BE', 'DE', 'FR', 'ES', 'UK', 'US', 'PT', 'IT', 'SE', 'DK', 'NO', 'CH', 'AT', 'PL'];
BEGIN
    IF NEW.country_code IS NOT NULL AND NOT (NEW.country_code = ANY(supported_countries)) THEN
        RAISE EXCEPTION 'Country code % is not supported. Supported countries: %', NEW.country_code, array_to_string(supported_countries, ', ');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate country code on insert/update
DROP TRIGGER IF EXISTS validate_club_country_code ON clubs;
CREATE TRIGGER validate_club_country_code
    BEFORE INSERT OR UPDATE OF country_code ON clubs
    FOR EACH ROW
    EXECUTE FUNCTION validate_country_code();

-- Grant necessary permissions
GRANT SELECT ON clubs TO authenticated;
GRANT UPDATE (country_code) ON clubs TO authenticated;
