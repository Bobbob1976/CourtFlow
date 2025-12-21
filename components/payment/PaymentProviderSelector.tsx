'use client';

import { useState } from 'react';

interface PaymentProviderSelectorProps {
    availableProviders: ('mollie' | 'stripe' | 'both');
    onSelect: (provider: 'mollie' | 'stripe') => void;
    selectedProvider?: 'mollie' | 'stripe';
}

export default function PaymentProviderSelector({
    availableProviders,
    onSelect,
    selectedProvider,
}: PaymentProviderSelectorProps) {
    const [selected, setSelected] = useState<'mollie' | 'stripe'>(
        selectedProvider || 'mollie'
    );

    const handleSelect = (provider: 'mollie' | 'stripe') => {
        setSelected(provider);
        onSelect(provider);
    };

    // If only one provider, auto-select and hide selector
    if (availableProviders === 'mollie') {
        return null;
    }
    if (availableProviders === 'stripe') {
        return null;
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Kies betaalmethode</h3>

            <div className="grid grid-cols-2 gap-4">
                {/* Mollie Option */}
                <button
                    onClick={() => handleSelect('mollie')}
                    className={`
            group relative overflow-hidden rounded-2xl p-6 
            transition-all duration-300 border-2
            ${selected === 'mollie'
                            ? 'border-courtflow-green bg-courtflow-green/10 shadow-lg shadow-courtflow-green/20'
                            : 'border-white/10 bg-white/5 hover:border-courtflow-green/50'
                        }
          `}
                >
                    {/* Glow Effect */}
                    {selected === 'mollie' && (
                        <div className="absolute inset-0 bg-gradient-to-br from-courtflow-green/20 to-transparent pointer-events-none" />
                    )}

                    <div className="relative z-10">
                        {/* Mollie Logo */}
                        <div className="flex items-center justify-center h-12 mb-3">
                            <div className="text-3xl font-bold text-white">
                                mollie
                            </div>
                        </div>

                        {/* Payment Methods */}
                        <div className="flex flex-wrap gap-2 justify-center mb-3">
                            <span className="px-2 py-1 text-xs rounded-lg bg-white/10 text-white/80">
                                iDEAL
                            </span>
                            <span className="px-2 py-1 text-xs rounded-lg bg-white/10 text-white/80">
                                Bancontact
                            </span>
                            <span className="px-2 py-1 text-xs rounded-lg bg-white/10 text-white/80">
                                Cards
                            </span>
                        </div>

                        {/* Selection Indicator */}
                        {selected === 'mollie' && (
                            <div className="flex items-center justify-center">
                                <div className="w-6 h-6 rounded-full bg-courtflow-green flex items-center justify-center">
                                    <span className="text-white text-sm">✓</span>
                                </div>
                            </div>
                        )}
                    </div>
                </button>

                {/* Stripe Option */}
                <button
                    onClick={() => handleSelect('stripe')}
                    className={`
            group relative overflow-hidden rounded-2xl p-6 
            transition-all duration-300 border-2
            ${selected === 'stripe'
                            ? 'border-[#635BFF] bg-[#635BFF]/10 shadow-lg shadow-[#635BFF]/20'
                            : 'border-white/10 bg-white/5 hover:border-[#635BFF]/50'
                        }
          `}
                >
                    {/* Glow Effect */}
                    {selected === 'stripe' && (
                        <div className="absolute inset-0 bg-gradient-to-br from-[#635BFF]/20 to-transparent pointer-events-none" />
                    )}

                    <div className="relative z-10">
                        {/* Stripe Logo */}
                        <div className="flex items-center justify-center h-12 mb-3">
                            <div className="text-3xl font-bold" style={{ color: '#635BFF' }}>
                                Stripe
                            </div>
                        </div>

                        {/* Payment Methods */}
                        <div className="flex flex-wrap gap-2 justify-center mb-3">
                            <span className="px-2 py-1 text-xs rounded-lg bg-white/10 text-white/80">
                                Visa
                            </span>
                            <span className="px-2 py-1 text-xs rounded-lg bg-white/10 text-white/80">
                                Mastercard
                            </span>
                            <span className="px-2 py-1 text-xs rounded-lg bg-white/10 text-white/80">
                                AMEX
                            </span>
                        </div>

                        {/* Selection Indicator */}
                        {selected === 'stripe' && (
                            <div className="flex items-center justify-center">
                                <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#635BFF' }}>
                                    <span className="text-white text-sm">✓</span>
                                </div>
                            </div>
                        )}
                    </div>
                </button>
            </div>

            {/* Info Text */}
            <p className="text-sm text-white/60 text-center">
                {selected === 'mollie'
                    ? '🇳🇱 iDEAL en andere Nederlandse betaalmethoden'
                    : '🌍 Internationale creditcards en betaalmethoden'
                }
            </p>
        </div>
    );
}
