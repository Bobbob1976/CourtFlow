import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Initialiseer Stripe alleen als de key bestaat (voorkomt build errors)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'dummy_key', {
  apiVersion: '2024-12-18.acacia',
});

export async function POST(request: NextRequest) {
  // Runtime check voor environment variabelen
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('Stripe keys missing');
    return NextResponse.json({ error: 'Configuration Error' }, { status: 500 });
  }

  // Initialiseer Supabase Admin client alleen tijdens runtime
  // Dit voorkomt "supabaseKey is required" errors tijdens de build fase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Supabase configuration missing');
    return NextResponse.json({ error: 'Database Configuration Error' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      // Zoek booking op basis van payment_intent ID (indien mogelijk)
      // Of update status direct
      await supabase
        .from('bookings')
        .update({
          payment_status: 'paid',
          stripe_payment_status: paymentIntent.status,
        })
        .eq('stripe_payment_intent_id', paymentIntent.id);

      console.log(`✅ Payment succeeded: ${paymentIntent.id}`);
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      await supabase
        .from('bookings')
        .update({
          payment_status: 'failed',
          stripe_payment_status: paymentIntent.status,
        })
        .eq('stripe_payment_intent_id', paymentIntent.id);

      console.log(`❌ Payment failed: ${paymentIntent.id}`);
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
