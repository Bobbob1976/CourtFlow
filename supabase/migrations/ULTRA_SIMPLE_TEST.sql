-- ULTRA SIMPLE TEST: Just create the table and insert ONE row

CREATE TABLE IF NOT EXISTS tax_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_code VARCHAR(2) NOT NULL,
    effective_from DATE NOT NULL,
    sport_rate DECIMAL(5,4) NOT NULL,
    goods_rate DECIMAL(5,4) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    sport_label VARCHAR(50) NOT NULL,
    goods_label VARCHAR(50) NOT NULL,
    country_name VARCHAR(100) NOT NULL
);

-- Insert just ONE country
INSERT INTO tax_rates (country_code, effective_from, sport_rate, goods_rate, currency, sport_label, goods_label, country_name) 
VALUES ('NL', '2024-01-01', 0.09, 0.21, '€', 'BTW 9%', 'BTW 21%', 'Nederland')
ON CONFLICT DO NOTHING;

-- Check if it worked
SELECT * FROM tax_rates;
