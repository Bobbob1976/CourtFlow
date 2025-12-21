import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-12-18.acacia',
});

export async function POST(request: NextRequest) {
    try {
        const { bookingId, amount, clubId } = await request.json();

        if (!bookingId || !amount) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const supabase = createClient();

        // Get booking details
        const { data: booking } = await supabase
            .from('bookings')
            .select('*, club:clubs(*)')
            .eq('id', bookingId)
            .single();

        if (!booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        // Create Stripe Payment Intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency: 'eur',
            metadata: {
                bookingId,
                clubId,
            },
            automatic_payment_methods: {
                enabled: true,
            },
        });

        // Update booking with Stripe payment intent
        await supabase
            .from('bookings')
            .update({
                stripe_payment_intent_id: paymentIntent.id,
                payment_provider: 'stripe',
                payment_status: 'pending',
            })
            .eq('id', bookingId);

        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
        });
    } catch (error) {
        console.error('Stripe checkout error:', error);
        return NextResponse.json(
            { error: 'Failed to create Stripe payment' },
            { status: 500 }
        );
    }
}
