-- Migration: Add major countries to tax rates system
-- Adding Canada, Australia, Japan, Brazil, Mexico, India, South Africa, New Zealand, Singapore, UAE

INSERT INTO tax_rates (country_code, effective_from, sport_rate, goods_rate, currency, sport_label, goods_label, country_name, notes) VALUES

-- Americas
('CA', '2024-01-01', 0.05, 0.13, 'C$', 'GST/HST 5%', 'GST/HST 13%', 'Canada', 'Federal GST 5%, combined HST varies by province (avg 13%)'),
('MX', '2024-01-01', 0.00, 0.16, '$', 'IVA 0%', 'IVA 16%', 'Mexico', 'Sports services exempt, goods 16%'),
('BR', '2024-01-01', 0.00, 0.17, 'R$', 'ICMS 0%', 'ICMS 17%', 'Brazilië', 'Sports exempt, ICMS varies by state (avg 17%)'),

-- Asia-Pacific
('AU', '2024-01-01', 0.00, 0.10, 'A$', 'GST 0%', 'GST 10%', 'Australië', 'Sports services GST-free, goods 10%'),
('NZ', '2024-01-01', 0.00, 0.15, 'NZ$', 'GST 0%', 'GST 15%', 'Nieuw-Zeeland', 'Sports services exempt, goods 15%'),
('JP', '2024-01-01', 0.08, 0.10, '¥', '消費税 8%', '消費税 10%', 'Japan', 'Reduced rate 8% for sports, standard 10%'),
('SG', '2024-01-01', 0.00, 0.09, 'S$', 'GST 0%', 'GST 9%', 'Singapore', 'Sports services exempt, goods 9%'),
('IN', '2024-01-01', 0.00, 0.18, '₹', 'GST 0%', 'GST 18%', 'India', 'Sports services exempt, goods 18%'),

-- Middle East & Africa
('AE', '2024-01-01', 0.00, 0.05, 'AED', 'VAT 0%', 'VAT 5%', 'Verenigde Arabische Emiraten', 'Sports exempt, goods 5%'),
('ZA', '2024-01-01', 0.00, 0.15, 'R', 'VAT 0%', 'VAT 15%', 'Zuid-Afrika', 'Sports services zero-rated, goods 15%'),

-- Additional European
('IE', '2024-01-01', 0.00, 0.23, '€', 'VAT 0%', 'VAT 23%', 'Ierland', 'Sports facilities exempt, goods 23%'),
('FI', '2024-01-01', 0.10, 0.255, '€', 'ALV 10%', 'ALV 25.5%', 'Finland', 'Reduced rate for sports'),
('GR', '2024-01-01', 0.06, 0.24, '€', 'ΦΠΑ 6%', 'ΦΠΑ 24%', 'Griekenland', 'Reduced rate for sports'),
('CZ', '2024-01-01', 0.12, 0.21, 'Kč', 'DPH 12%', 'DPH 21%', 'Tsjechië', 'Reduced rate for sports'),
('HU', '2024-01-01', 0.05, 0.27, 'Ft', 'ÁFA 5%', 'ÁFA 27%', 'Hongarije', 'Reduced rate for sports')

ON CONFLICT (country_code, effective_from) DO NOTHING;

-- Update the validation function to include new countries
CREATE OR REPLACE FUNCTION validate_country_code()
RETURNS TRIGGER AS $$
DECLARE
    supported_countries TEXT[] := ARRAY[
        'NL', 'BE', 'DE', 'FR', 'ES', 'UK', 'US', 'PT', 'IT', 'SE', 'DK', 'NO', 'CH', 'AT', 'PL',
        'CA', 'MX', 'BR', 'AU', 'NZ', 'JP', 'SG', 'IN', 'AE', 'ZA', 'IE', 'FI', 'GR', 'CZ', 'HU'
    ];
BEGIN
    IF NEW.country_code IS NOT NULL AND NOT (NEW.country_code = ANY(supported_countries)) THEN
        RAISE EXCEPTION 'Country code % is not supported. Supported countries: %', NEW.country_code, array_to_string(supported_countries, ', ');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
DROP TRIGGER IF EXISTS validate_club_country_code ON clubs;
CREATE TRIGGER validate_club_country_code
    BEFORE INSERT OR UPDATE OF country_code ON clubs
    FOR EACH ROW
    EXECUTE FUNCTION validate_country_code();

-- Add comment
COMMENT ON TABLE tax_rates IS 'Tax rates for 30 countries worldwide. Supports automatic yearly updates and historical tracking.';
