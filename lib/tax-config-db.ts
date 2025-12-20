// Server-side tax configuration that fetches from database
// This replaces the hardcoded tax-config.ts for production use

import { createClient } from "@/utils/supabase/server";

export interface TaxRate {
    country: string;
    currency: string;
    sportRate: number;
    goodsRate: number;
    sportLabel: string;
    goodsLabel: string;
}

// Fallback hardcoded rates (used if database is unavailable)
const FALLBACK_RATES: { [key: string]: TaxRate } = {
    'NL': {
        country: 'Nederland',
        currency: '€',
        sportRate: 0.09,
        goodsRate: 0.21,
        sportLabel: 'BTW 9%',
        goodsLabel: 'BTW 21%'
    },
    'US': {
        country: 'Verenigde Staten',
        currency: '$',
        sportRate: 0.00,
        goodsRate: 0.08,
        sportLabel: 'Sales Tax 0%',
        goodsLabel: 'Sales Tax 8%'
    }
};

/**
 * Get tax configuration from database for a specific country
 * Falls back to hardcoded rates if database is unavailable
 */
export async function getTaxConfigFromDB(countryCode: string = 'NL', date?: Date): Promise<TaxRate> {
    try {
        const supabase = createClient();

        // Call the database function to get active tax rate
        const { data, error } = await supabase
            .rpc('get_active_tax_rate', {
                p_country_code: countryCode.toUpperCase(),
                p_date: date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
            })
            .single();

        if (error) {
            console.error('Error fetching tax rate from database:', error);
            return FALLBACK_RATES[countryCode.toUpperCase()] || FALLBACK_RATES['NL'];
        }

        if (!data) {
            console.warn(`No tax rate found for country ${countryCode}, using fallback`);
            return FALLBACK_RATES[countryCode.toUpperCase()] || FALLBACK_RATES['NL'];
        }

        return {
            country: data.country_name,
            currency: data.currency,
            sportRate: parseFloat(data.sport_rate),
            goodsRate: parseFloat(data.goods_rate),
            sportLabel: data.sport_label,
            goodsLabel: data.goods_label
        };
    } catch (err) {
        console.error('Failed to fetch tax config:', err);
        return FALLBACK_RATES[countryCode.toUpperCase()] || FALLBACK_RATES['NL'];
    }
}

/**
 * Format currency with country-specific symbol
 */
export function formatCurrencyDB(amount: number, taxConfig: TaxRate): string {
    return `${taxConfig.currency}${amount.toFixed(2)}`;
}

/**
 * Get all supported countries from database
 */
export async function getSupportedCountries(): Promise<Array<{ code: string; name: string; currency: string }>> {
    try {
        const supabase = createClient();

        const { data, error } = await supabase
            .from('tax_rates')
            .select('country_code, country_name, currency')
            .is('effective_until', null)
            .order('country_name');

        if (error) {
            console.error('Error fetching supported countries:', error);
            return [];
        }

        return (data || []).map(row => ({
            code: row.country_code,
            name: row.country_name,
            currency: row.currency
        }));
    } catch (err) {
        console.error('Failed to fetch supported countries:', err);
        return [];
    }
}
