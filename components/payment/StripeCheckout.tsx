'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface StripeCheckoutFormProps {
    clientSecret: string;
    amount: number;
    onSuccess: () => void;
    onError: (error: string) => void;
}

function CheckoutForm({ clientSecret, amount, onSuccess, onError }: StripeCheckoutFormProps) {
    const stripe = useStripe();
    const elements = useElements();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsLoading(true);

        try {
            const { error } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/booking/success`,
                },
            });

            if (error) {
                onError(error.message || 'Payment failed');
            } else {
                onSuccess();
            }
        } catch (err) {
            onError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement />

            <button
                type="submit"
                disabled={!stripe || isLoading}
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-[#635BFF] to-[#8b5cf6] 
                   text-white font-semibold text-lg shadow-lg shadow-[#635BFF]/30
                   hover:shadow-xl hover:scale-[1.02] transition-all duration-300
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            >
                {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Verwerken...
                    </span>
                ) : (
                    `Betaal €${amount.toFixed(2)}`
                )}
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-white/50">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Beveiligde betaling via Stripe
            </div>
        </form>
    );
}

export default function StripeCheckout({
    bookingId,
    amount,
    onSuccess,
    onError,
}: {
    bookingId: string;
    amount: number;
    onSuccess: () => void;
    onError: (error: string) => void;
}) {
    const [clientSecret, setClientSecret] = useState<string | null>(null);

    useEffect(() => {
        // Create payment intent
        async function createPaymentIntent() {
            try {
                const response = await fetch('/api/stripe/checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ bookingId, amount }),
                });

                const data = await response.json();
                if (data.clientSecret) {
                    setClientSecret(data.clientSecret);
                } else {
                    onError('Failed to initialize payment');
                }
            } catch (error) {
                onError('Failed to initialize payment');
            }
        }

        createPaymentIntent();
    }, [bookingId, amount, onError]);

    if (!clientSecret) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-[#635BFF]/30 border-t-[#635BFF] rounded-full animate-spin" />
            </div>
        );
    }

    const options = {
        clientSecret,
        appearance: {
            theme: 'night' as const,
            variables: {
                colorPrimary: '#635BFF',
                colorBackground: '#1a1a1a',
                colorText: '#ffffff',
                colorDanger: '#ff6b35',
                borderRadius: '12px',
            },
        },
    };

    return (
        <Elements stripe={stripePromise} options={options}>
            <CheckoutForm
                clientSecret={clientSecret}
                amount={amount}
                onSuccess={onSuccess}
                onError={onError}
            />
        </Elements>
    );
}
