-- Verification: Check all countries in the system

SELECT 
    country_code,
    country_name,
    currency,
    sport_label,
    goods_label,
    effective_from
FROM tax_rates
WHERE effective_until IS NULL
ORDER BY country_name;
