// Tax configuration per country
// Add more countries as needed

export interface TaxRate {
    country: string;
    currency: string;
    sportRate: number; // VAT rate for sports services
    goodsRate: number; // VAT rate for goods/products
    sportLabel: string;
    goodsLabel: string;
}

export const TAX_RATES: { [key: string]: TaxRate } = {
    'NL': {
        country: 'Nederland',
        currency: '€',
        sportRate: 0.09,  // 9% BTW voor sport
        goodsRate: 0.21,  // 21% BTW voor goederen
        sportLabel: 'BTW 9%',
        goodsLabel: 'BTW 21%'
    },
    'BE': {
        country: 'België',
        currency: '€',
        sportRate: 0.06,  // 6% BTW voor sport
        goodsRate: 0.21,  // 21% BTW voor goederen
        sportLabel: 'BTW 6%',
        goodsLabel: 'BTW 21%'
    },
    'DE': {
        country: 'Duitsland',
        currency: '€',
        sportRate: 0.07,  // 7% MwSt für Sport
        goodsRate: 0.19,  // 19% MwSt für Waren
        sportLabel: 'MwSt 7%',
        goodsLabel: 'MwSt 19%'
    },
    'FR': {
        country: 'Frankrijk',
        currency: '€',
        sportRate: 0.055, // 5.5% TVA pour sport
        goodsRate: 0.20,  // 20% TVA pour biens
        sportLabel: 'TVA 5.5%',
        goodsLabel: 'TVA 20%'
    },
    'ES': {
        country: 'Spanje',
        currency: '€',
        sportRate: 0.10,  // 10% IVA para deporte
        goodsRate: 0.21,  // 21% IVA para bienes
        sportLabel: 'IVA 10%',
        goodsLabel: 'IVA 21%'
    },
    'UK': {
        country: 'Verenigd Koninkrijk',
        currency: '£',
        sportRate: 0.00,  // 0% VAT for sports facilities
        goodsRate: 0.20,  // 20% VAT for goods
        sportLabel: 'VAT 0%',
        goodsLabel: 'VAT 20%'
    },
    'US': {
        country: 'Verenigde Staten',
        currency: '$',
        sportRate: 0.00,  // Varies by state, often exempt
        goodsRate: 0.08,  // Average sales tax (varies by state)
        sportLabel: 'Sales Tax 0%',
        goodsLabel: 'Sales Tax 8%'
    },
    'PT': {
        country: 'Portugal',
        currency: '€',
        sportRate: 0.06,  // 6% IVA para desporto
        goodsRate: 0.23,  // 23% IVA para bens
        sportLabel: 'IVA 6%',
        goodsLabel: 'IVA 23%'
    },
    'IT': {
        country: 'Italië',
        currency: '€',
        sportRate: 0.10,  // 10% IVA per sport
        goodsRate: 0.22,  // 22% IVA per beni
        sportLabel: 'IVA 10%',
        goodsLabel: 'IVA 22%'
    },
    'SE': {
        country: 'Zweden',
        currency: 'kr',
        sportRate: 0.06,  // 6% moms för sport
        goodsRate: 0.25,  // 25% moms för varor
        sportLabel: 'Moms 6%',
        goodsLabel: 'Moms 25%'
    },
    'DK': {
        country: 'Denemarken',
        currency: 'kr',
        sportRate: 0.25,  // 25% moms (no reduced rate)
        goodsRate: 0.25,  // 25% moms
        sportLabel: 'Moms 25%',
        goodsLabel: 'Moms 25%'
    },
    'NO': {
        country: 'Noorwegen',
        currency: 'kr',
        sportRate: 0.12,  // 12% MVA for sport
        goodsRate: 0.25,  // 25% MVA for goods
        sportLabel: 'MVA 12%',
        goodsLabel: 'MVA 25%'
    },
    'CH': {
        country: 'Zwitserland',
        currency: 'CHF',
        sportRate: 0.026, // 2.6% MwSt für Sport (reduced rate)
        goodsRate: 0.081, // 8.1% MwSt für Waren
        sportLabel: 'MwSt 2.6%',
        goodsLabel: 'MwSt 8.1%'
    },
    'AT': {
        country: 'Oostenrijk',
        currency: '€',
        sportRate: 0.13,  // 13% USt für Sport
        goodsRate: 0.20,  // 20% USt für Waren
        sportLabel: 'USt 13%',
        goodsLabel: 'USt 20%'
    },
    'PL': {
        country: 'Polen',
        currency: 'zł',
        sportRate: 0.08,  // 8% VAT dla sportu
        goodsRate: 0.23,  // 23% VAT dla towarów
        sportLabel: 'VAT 8%',
        goodsLabel: 'VAT 23%'
    }
};

// Helper function to get tax config for a country
export function getTaxConfig(countryCode: string = 'NL'): TaxRate {
    return TAX_RATES[countryCode.toUpperCase()] || TAX_RATES['NL'];
}

// Helper to format currency
export function formatCurrency(amount: number, countryCode: string = 'NL'): string {
    const config = getTaxConfig(countryCode);
    return `${config.currency}${amount.toFixed(2)}`;
}
