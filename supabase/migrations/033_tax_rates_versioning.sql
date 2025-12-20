-- Migration: Tax rates versioning system for automatic yearly updates
-- This allows historical tax rate tracking and automatic updates

-- Create tax_rates table to store historical and current tax rates
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

-- Add indexes
CREATE INDEX idx_tax_rates_country ON tax_rates(country_code);
CREATE INDEX idx_tax_rates_effective ON tax_rates(effective_from, effective_until);
CREATE INDEX idx_tax_rates_active ON tax_rates(country_code, effective_from) WHERE effective_until IS NULL;

-- Insert current tax rates (2024-2025)
INSERT INTO tax_rates (country_code, effective_from, sport_rate, goods_rate, currency, sport_label, goods_label, country_name, notes) VALUES
-- Europe
('NL', '2024-01-01', 0.09, 0.21, '€', 'BTW 9%', 'BTW 21%', 'Nederland', 'Reduced rate for sports services'),
('BE', '2024-01-01', 0.06, 0.21, '€', 'BTW 6%', 'BTW 21%', 'België', 'Reduced rate for sports services'),
('DE', '2024-01-01', 0.07, 0.19, '€', 'MwSt 7%', 'MwSt 19%', 'Duitsland', 'Ermäßigter Steuersatz für Sport'),
('FR', '2024-01-01', 0.055, 0.20, '€', 'TVA 5.5%', 'TVA 20%', 'Frankrijk', 'Taux réduit pour le sport'),
('ES', '2024-01-01', 0.10, 0.21, '€', 'IVA 10%', 'IVA 21%', 'Spanje', 'Tipo reducido para deporte'),
('PT', '2024-01-01', 0.06, 0.23, '€', 'IVA 6%', 'IVA 23%', 'Portugal', 'Taxa reduzida para desporto'),
('IT', '2024-01-01', 0.10, 0.22, '€', 'IVA 10%', 'IVA 22%', 'Italië', 'Aliquota ridotta per sport'),
('AT', '2024-01-01', 0.13, 0.20, '€', 'USt 13%', 'USt 20%', 'Oostenrijk', 'Ermäßigter Steuersatz'),
('PL', '2024-01-01', 0.08, 0.23, 'zł', 'VAT 8%', 'VAT 23%', 'Polen', 'Obniżona stawka dla sportu'),

-- Scandinavia
('SE', '2024-01-01', 0.06, 0.25, 'kr', 'Moms 6%', 'Moms 25%', 'Zweden', 'Reducerad moms för sport'),
('DK', '2024-01-01', 0.25, 0.25, 'kr', 'Moms 25%', 'Moms 25%', 'Denemarken', 'No reduced rate in Denmark'),
('NO', '2024-01-01', 0.12, 0.25, 'kr', 'MVA 12%', 'MVA 25%', 'Noorwegen', 'Redusert sats for sport'),

-- Other Europe
('CH', '2024-01-01', 0.026, 0.081, 'CHF', 'MwSt 2.6%', 'MwSt 8.1%', 'Zwitserland', 'Reduzierter Satz für Sport'),
('UK', '2024-01-01', 0.00, 0.20, '£', 'VAT 0%', 'VAT 20%', 'Verenigd Koninkrijk', 'Sports facilities are VAT exempt'),

-- Americas
('US', '2024-01-01', 0.00, 0.08, '$', 'Sales Tax 0%', 'Sales Tax 8%', 'Verenigde Staten', 'Varies by state, average shown')
ON CONFLICT (country_code, effective_from) DO NOTHING;

-- Function to get active tax rate for a country
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
    SELECT 
        tr.sport_rate,
        tr.goods_rate,
        tr.currency,
        tr.sport_label,
        tr.goods_label,
        tr.country_name
    FROM tax_rates tr
    WHERE tr.country_code = p_country_code
      AND tr.effective_from <= p_date
      AND (tr.effective_until IS NULL OR tr.effective_until >= p_date)
    ORDER BY tr.effective_from DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to add new tax rate (for yearly updates)
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
    -- Get current active rate
    SELECT * INTO v_current_rate
    FROM tax_rates
    WHERE country_code = p_country_code
      AND effective_until IS NULL
    ORDER BY effective_from DESC
    LIMIT 1;

    -- Close current rate
    IF v_current_rate IS NOT NULL THEN
        UPDATE tax_rates
        SET effective_until = p_effective_from - INTERVAL '1 day',
            updated_at = NOW()
        WHERE id = v_current_rate.id;
    END IF;

    -- Insert new rate
    INSERT INTO tax_rates (
        country_code,
        effective_from,
        sport_rate,
        goods_rate,
        currency,
        sport_label,
        goods_label,
        country_name,
        notes
    )
    SELECT
        p_country_code,
        p_effective_from,
        p_sport_rate,
        p_goods_rate,
        v_current_rate.currency,
        REPLACE(v_current_rate.sport_label, 
                ROUND(v_current_rate.sport_rate * 100)::TEXT || '%',
                ROUND(p_sport_rate * 100)::TEXT || '%'),
        REPLACE(v_current_rate.goods_label,
                ROUND(v_current_rate.goods_rate * 100)::TEXT || '%',
                ROUND(p_goods_rate * 100)::TEXT || '%'),
        v_current_rate.country_name,
        p_notes
    RETURNING id INTO v_rate_id;

    RETURN v_rate_id;
END;
$$ LANGUAGE plpgsql;

-- Example: How to add a tax rate update for 2026
-- SELECT add_tax_rate_update('NL', '2026-01-01', 0.09, 0.22, 'BTW verhoogd van 21% naar 22%');

-- Grant permissions
GRANT SELECT ON tax_rates TO authenticated;
GRANT EXECUTE ON FUNCTION get_active_tax_rate TO authenticated;

-- Add comment
COMMENT ON TABLE tax_rates IS 'Historical and current tax rates per country. Supports automatic yearly updates and historical rate tracking.';
