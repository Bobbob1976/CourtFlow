-- STEP 2 FIXED: Tax System Setup (without problematic GRANT)
-- Run this after confirming country_code exists in clubs table

-- Create tax_rates table
CREATE TABLE IF NOT EXISTS tax_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_code VARCHAR(2) NOT NULL,
    effective_from DATE NOT NULL,
    effective_until DATE,
    sport_rate DECIMAL(5,4) NOT NULL CHECK (sport_rate >= 0 AND sport_rate <= 1),
    goods_rate DECIMAL(5,4) NOT NULL CHECK (goods_rate >= 0 AND goods_rate <= 1),
    currency VARCHAR(10) NOT NULL,
    sport_label VARCHAR(50) NOT NULL,
    goods_label VARCHAR(50) NOT NULL,
    country_name VARCHAR(100) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(country_code, effective_from)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tax_rates_country ON tax_rates(country_code);
CREATE INDEX IF NOT EXISTS idx_tax_rates_effective ON tax_rates(effective_from, effective_until);
CREATE INDEX IF NOT EXISTS idx_tax_rates_active ON tax_rates(country_code, effective_from) WHERE effective_until IS NULL;

-- Insert 30 countries
INSERT INTO tax_rates (country_code, effective_from, sport_rate, goods_rate, currency, sport_label, goods_label, country_name, notes) VALUES
('NL', '2024-01-01', 0.09, 0.21, '€', 'BTW 9%', 'BTW 21%', 'Nederland', 'Reduced rate for sports'),
('BE', '2024-01-01', 0.06, 0.21, '€', 'BTW 6%', 'BTW 21%', 'België', 'Reduced rate for sports'),
('DE', '2024-01-01', 0.07, 0.19, '€', 'MwSt 7%', 'MwSt 19%', 'Duitsland', 'Reduced rate for sports'),
('FR', '2024-01-01', 0.055, 0.20, '€', 'TVA 5.5%', 'TVA 20%', 'Frankrijk', 'Reduced rate for sports'),
('ES', '2024-01-01', 0.10, 0.21, '€', 'IVA 10%', 'IVA 21%', 'Spanje', 'Reduced rate for sports'),
('PT', '2024-01-01', 0.06, 0.23, '€', 'IVA 6%', 'IVA 23%', 'Portugal', 'Reduced rate for sports'),
('IT', '2024-01-01', 0.10, 0.22, '€', 'IVA 10%', 'IVA 22%', 'Italië', 'Reduced rate for sports'),
('AT', '2024-01-01', 0.13, 0.20, '€', 'USt 13%', 'USt 20%', 'Oostenrijk', 'Reduced rate for sports'),
('PL', '2024-01-01', 0.08, 0.23, 'zł', 'VAT 8%', 'VAT 23%', 'Polen', 'Reduced rate for sports'),
('SE', '2024-01-01', 0.06, 0.25, 'kr', 'Moms 6%', 'Moms 25%', 'Zweden', 'Reduced rate for sports'),
('DK', '2024-01-01', 0.25, 0.25, 'kr', 'Moms 25%', 'Moms 25%', 'Denemarken', 'No reduced rate'),
('NO', '2024-01-01', 0.12, 0.25, 'kr', 'MVA 12%', 'MVA 25%', 'Noorwegen', 'Reduced rate for sports'),
('CH', '2024-01-01', 0.026, 0.081, 'CHF', 'MwSt 2.6%', 'MwSt 8.1%', 'Zwitserland', 'Reduced rate'),
('UK', '2024-01-01', 0.00, 0.20, '£', 'VAT 0%', 'VAT 20%', 'UK', 'Sports exempt'),
('IE', '2024-01-01', 0.00, 0.23, '€', 'VAT 0%', 'VAT 23%', 'Ierland', 'Sports exempt'),
('FI', '2024-01-01', 0.10, 0.255, '€', 'ALV 10%', 'ALV 25.5%', 'Finland', 'Reduced rate'),
('GR', '2024-01-01', 0.06, 0.24, '€', 'ΦΠΑ 6%', 'ΦΠΑ 24%', 'Griekenland', 'Reduced rate'),
('CZ', '2024-01-01', 0.12, 0.21, 'Kč', 'DPH 12%', 'DPH 21%', 'Tsjechië', 'Reduced rate'),
('HU', '2024-01-01', 0.05, 0.27, 'Ft', 'ÁFA 5%', 'ÁFA 27%', 'Hongarije', 'Reduced rate'),
('US', '2024-01-01', 0.00, 0.08, '$', 'Sales Tax 0%', 'Sales Tax 8%', 'USA', 'Varies by state'),
('CA', '2024-01-01', 0.05, 0.13, 'C$', 'GST/HST 5%', 'GST/HST 13%', 'Canada', 'Federal GST'),
('MX', '2024-01-01', 0.00, 0.16, '$', 'IVA 0%', 'IVA 16%', 'Mexico', 'Sports exempt'),
('BR', '2024-01-01', 0.00, 0.17, 'R$', 'ICMS 0%', 'ICMS 17%', 'Brazilië', 'Sports exempt'),
('AU', '2024-01-01', 0.00, 0.10, 'A$', 'GST 0%', 'GST 10%', 'Australië', 'Sports GST-free'),
('NZ', '2024-01-01', 0.00, 0.15, 'NZ$', 'GST 0%', 'GST 15%', 'Nieuw-Zeeland', 'Sports exempt'),
('JP', '2024-01-01', 0.08, 0.10, '¥', '消費税 8%', '消費税 10%', 'Japan', 'Reduced rate'),
('SG', '2024-01-01', 0.00, 0.09, 'S$', 'GST 0%', 'GST 9%', 'Singapore', 'Sports exempt'),
('IN', '2024-01-01', 0.00, 0.18, '₹', 'GST 0%', 'GST 18%', 'India', 'Sports exempt'),
('AE', '2024-01-01', 0.00, 0.05, 'AED', 'VAT 0%', 'VAT 5%', 'UAE', 'Sports exempt'),
('ZA', '2024-01-01', 0.00, 0.15, 'R', 'VAT 0%', 'VAT 15%', 'Zuid-Afrika', 'Sports zero-rated')
ON CONFLICT (country_code, effective_from) DO NOTHING;

-- Functions
CREATE OR REPLACE FUNCTION get_active_tax_rate(p_country_code VARCHAR(2), p_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
    sport_rate DECIMAL,
    goods_rate DECIMAL,
    currency VARCHAR,
    sport_label VARCHAR,
    goods_label VARCHAR,
    country_name VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT tr.sport_rate, tr.goods_rate, tr.currency, tr.sport_label, tr.goods_label, tr.country_name
    FROM tax_rates tr
    WHERE tr.country_code = p_country_code
      AND tr.effective_from <= p_date
      AND (tr.effective_until IS NULL OR tr.effective_until >= p_date)
    ORDER BY tr.effective_from DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION add_tax_rate_update(
    p_country_code VARCHAR(2),
    p_effective_from DATE,
    p_sport_rate DECIMAL,
    p_goods_rate DECIMAL,
    p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_rate_id UUID;
    v_current_rate RECORD;
BEGIN
    SELECT * INTO v_current_rate FROM tax_rates
    WHERE country_code = p_country_code AND effective_until IS NULL
    ORDER BY effective_from DESC LIMIT 1;

    IF v_current_rate IS NOT NULL THEN
        UPDATE tax_rates SET effective_until = p_effective_from - INTERVAL '1 day', updated_at = NOW()
        WHERE id = v_current_rate.id;
    END IF;

    INSERT INTO tax_rates (country_code, effective_from, sport_rate, goods_rate, currency, sport_label, goods_label, country_name, notes)
    SELECT p_country_code, p_effective_from, p_sport_rate, p_goods_rate, v_current_rate.currency,
           REPLACE(v_current_rate.sport_label, ROUND(v_current_rate.sport_rate * 100)::TEXT || '%', ROUND(p_sport_rate * 100)::TEXT || '%'),
           REPLACE(v_current_rate.goods_label, ROUND(v_current_rate.goods_rate * 100)::TEXT || '%', ROUND(p_goods_rate * 100)::TEXT || '%'),
           v_current_rate.country_name, p_notes
    RETURNING id INTO v_rate_id;

    RETURN v_rate_id;
END;
$$ LANGUAGE plpgsql;

-- Validation function
CREATE OR REPLACE FUNCTION validate_country_code()
RETURNS TRIGGER AS $$
DECLARE
    supported_countries TEXT[] := ARRAY[
        'NL', 'BE', 'DE', 'FR', 'ES', 'UK', 'US', 'PT', 'IT', 'SE', 'DK', 'NO', 'CH', 'AT', 'PL',
        'CA', 'MX', 'BR', 'AU', 'NZ', 'JP', 'SG', 'IN', 'AE', 'ZA', 'IE', 'FI', 'GR', 'CZ', 'HU'
    ];
BEGIN
    IF NEW.country_code IS NOT NULL AND NOT (NEW.country_code = ANY(supported_countries)) THEN
        RAISE EXCEPTION 'Country code % not supported', NEW.country_code;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS validate_club_country_code ON clubs;
CREATE TRIGGER validate_club_country_code
    BEFORE INSERT OR UPDATE OF country_code ON clubs
    FOR EACH ROW EXECUTE FUNCTION validate_country_code();

-- Permissions (simplified - no column-specific grants)
GRANT SELECT ON clubs TO authenticated;
GRANT SELECT ON tax_rates TO authenticated;
GRANT EXECUTE ON FUNCTION get_active_tax_rate TO authenticated;

-- Comments
COMMENT ON TABLE tax_rates IS 'Tax rates for 30 countries with versioning';
COMMENT ON FUNCTION get_active_tax_rate IS 'Get active tax rate for a country';
COMMENT ON FUNCTION add_tax_rate_update IS 'Add new tax rate update';

-- Verify
SELECT COUNT(*) as total_countries FROM tax_rates WHERE effective_until IS NULL;
