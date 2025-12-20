-- MINIMAL VERSION: Just tax_rates table and functions
-- NO triggers, NO permissions on clubs table

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

-- Insert 30 countries
INSERT INTO tax_rates (country_code, effective_from, sport_rate, goods_rate, currency, sport_label, goods_label, country_name, notes) VALUES
('NL', '2024-01-01', 0.09, 0.21, '€', 'BTW 9%', 'BTW 21%', 'Nederland', 'Reduced rate'),
('BE', '2024-01-01', 0.06, 0.21, '€', 'BTW 6%', 'BTW 21%', 'België', 'Reduced rate'),
('DE', '2024-01-01', 0.07, 0.19, '€', 'MwSt 7%', 'MwSt 19%', 'Duitsland', 'Reduced rate'),
('FR', '2024-01-01', 0.055, 0.20, '€', 'TVA 5.5%', 'TVA 20%', 'Frankrijk', 'Reduced rate'),
('ES', '2024-01-01', 0.10, 0.21, '€', 'IVA 10%', 'IVA 21%', 'Spanje', 'Reduced rate'),
('PT', '2024-01-01', 0.06, 0.23, '€', 'IVA 6%', 'IVA 23%', 'Portugal', 'Reduced rate'),
('IT', '2024-01-01', 0.10, 0.22, '€', 'IVA 10%', 'IVA 22%', 'Italië', 'Reduced rate'),
('AT', '2024-01-01', 0.13, 0.20, '€', 'USt 13%', 'USt 20%', 'Oostenrijk', 'Reduced rate'),
('PL', '2024-01-01', 0.08, 0.23, 'zł', 'VAT 8%', 'VAT 23%', 'Polen', 'Reduced rate'),
('SE', '2024-01-01', 0.06, 0.25, 'kr', 'Moms 6%', 'Moms 25%', 'Zweden', 'Reduced rate'),
('DK', '2024-01-01', 0.25, 0.25, 'kr', 'Moms 25%', 'Moms 25%', 'Denemarken', 'No reduced rate'),
('NO', '2024-01-01', 0.12, 0.25, 'kr', 'MVA 12%', 'MVA 25%', 'Noorwegen', 'Reduced rate'),
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

-- Function to get active tax rate
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

-- Function to add new tax rate
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

-- Permissions
GRANT SELECT ON tax_rates TO authenticated;
GRANT EXECUTE ON FUNCTION get_active_tax_rate TO authenticated;

-- Verify
SELECT COUNT(*) as total_countries FROM tax_rates WHERE effective_until IS NULL;
