"use server";

// PHASE 1 FINALE: Checkout Flow - Server Actions
// Server-side functions for creating Stripe Connect checkout sessions

import Stripe from "stripe";
import { createClient } from "utils/supabase/server";

// Initialize Stripe with secret key
let stripeInstance: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2024-06-20",
    });
  }
  return stripeInstance;
}

const supabase = createClient();

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

export interface CreateCheckoutSessionParams {
  bookingId: string;
}

export interface CreateSplitCheckoutSessionParams {
  bookingId: string;
  numberOfSplits: number;
  shareId: string; // The ID of the specific booking_share being paid
}

export interface BookingWithDetails {
  id: string;
  club_id: string;
  court_id: string;
  user_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  total_cost: number;
  status: string;
  payment_status: string;
  attendees: number;
  booking_notes?: string;
  clubs: {
    id: string;
    name: string;
    subdomain: string;
    stripe_account_id: string;
  };
  courts: {
    id: string;
    name: string;
    court_type: string;
  };
}

export interface CheckoutSessionResult {
  success: boolean;
  data?: {
    sessionId: string;
    url: string;
  };
  error?: string;
}

// =============================================================================
// CREATE CHECKOUT SESSION WITH STRIPE CONNECT
// =============================================================================

export async function createCheckoutSession(
  params: CreateCheckoutSessionParams
): Promise<CheckoutSessionResult> {
  try {
    // Verify user has permission
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Fetch booking details with club and court information
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(
        `
        *,
        clubs:club_id (
          id,
          name,
          subdomain,
          stripe_account_id
        ),
        courts:court_id (
          id,
          name,
          court_type
        )
      `
      )
      .eq("id", params.bookingId)
      .eq("user_id", user.id) // Ensure user owns this booking
      .single();

    if (bookingError || !booking) {
      console.error("Booking not found or access denied:", bookingError);
      return { success: false, error: "Booking not found or access denied" };
    }

    const bookingWithDetails = booking as BookingWithDetails;

    // Validate booking status
    if (
      bookingWithDetails.status !== "confirmed" &&
      bookingWithDetails.status !== "pending"
    ) {
      return { success: false, error: "Invalid booking status for payment" };
    }

    // Check if payment already processed
    if (bookingWithDetails.payment_status === "paid") {
      return { success: false, error: "Booking already paid" };
    }

    // Verify club has Stripe Connect account
    if (!bookingWithDetails.clubs.stripe_account_id) {
      return {
        success: false,
        error:
          "Club has not completed Stripe Connect onboarding. Please contact the club administrator.",
      };
    }

    // Format booking details for Stripe
    const courtName = bookingWithDetails.courts.name;
    const courtType = bookingWithDetails.courts.court_type;
    const bookingDate = new Date(
      bookingWithDetails.booking_date
    ).toLocaleDateString("nl-NL");
    const startTime = bookingWithDetails.start_time.slice(0, 5); // Remove seconds
    const endTime = bookingWithDetails.end_time.slice(0, 5);
    const attendees = bookingWithDetails.attendees;

    // Create Stripe Checkout Session with Connect transfer
    const checkoutSession = await getStripe().checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],

      // Line items for the booking
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `${courtName} (${courtType})`,
              description: `Booking op ${bookingDate} van ${startTime} tot ${endTime} voor ${attendees} persoon${
                attendees > 1 ? "nen" : ""
              }`,
            },
            unit_amount: Math.round(bookingWithDetails.total_cost * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],

      // CRUCIAL: Transfer money to the connected club account
      payment_intent_data: {
        transfer_data: {
          destination: bookingWithDetails.clubs.stripe_account_id,
        },
        // No application fee for transparent growth model (0% commission)
        metadata: {
          booking_id: bookingWithDetails.id,
          club_id: bookingWithDetails.club_id,
          user_id: bookingWithDetails.user_id,
          court_id: bookingWithDetails.court_id,
        },
      },

      // Success and cancel URLs
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/club/${bookingWithDetails.clubs.subdomain}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/club/${bookingWithDetails.clubs.subdomain}/booking/failed?booking_id=${bookingWithDetails.id}`,

      // Customer and metadata
      customer_email: user.email,
      metadata: {
        booking_id: bookingWithDetails.id,
        club_id: bookingWithDetails.club_id,
        club_subdomain: bookingWithDetails.clubs.subdomain,
        user_id: bookingWithDetails.user_id,
      },

      // Customization
      billing_address_collection: "required",
      payment_method_options: {
        card: {
          request_three_d_secure: "automatic",
        },
      },
    });

    console.log("✅ Created checkout session:", {
      sessionId: checkoutSession.id,
      bookingId: bookingWithDetails.id,
      clubSubdomain: bookingWithDetails.clubs.subdomain,
      amount: bookingWithDetails.total_cost,
      destination: bookingWithDetails.clubs.stripe_account_id,
    });

    return {
      success: true,
      data: {
        sessionId: checkoutSession.id,
        url: checkoutSession.url!,
      },
    };
  } catch (error) {
    console.error("❌ Error creating checkout session:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

// =============================================================================
// RETRIEVE CHECKOUT SESSION
// =============================================================================

export async function getCheckoutSession(sessionId: string): Promise<{
  success: boolean;
  data?: Stripe.Checkout.Session;
  error?: string;
}> {
  try {
  const session = await getStripe().checkout.sessions.retrieve(sessionId);
    return { success: true, data: session };
  } catch (error) {
    console.error("Error retrieving checkout session:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// =============================================================================
// CANCEL BOOKING (REFUND PROCESSING)
// =============================================================================

export async function cancelBookingWithRefund(
  bookingId: string,
  reason?: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Verify user has permission
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Get booking details
    const { data: booking } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .eq("user_id", user.id)
      .single();

    if (!booking) {
      return { success: false, error: "Booking not found" };
    }

    // Only process refund if payment was made
    if (booking.payment_status === "paid" && booking.status === "confirmed") {
      // Find the payment intent from Stripe
      // In a real implementation, you'd store the payment_intent_id when creating the session
      // For now, we'll assume we need to search for it

      // Update booking status to cancelled
      const { error: updateError } = await supabase
        .from("bookings")
        .update({
          status: "cancelled",
          cancellation_reason: reason || "User requested cancellation",
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", bookingId);

      if (updateError) {
        return { success: false, error: "Failed to update booking status" };
      }

      // TODO: Process refund through Stripe
      // This would require storing payment_intent_id and calling stripe.refunds.create()

      return { success: true };
    } else {
      // Just cancel without refund
      const { error: updateError } = await supabase
        .from("bookings")
        .update({
          status: "cancelled",
          cancellation_reason: reason || "User requested cancellation",
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", bookingId);

      if (updateError) {
        return { success: false, error: "Failed to update booking status" };
      }

      return { success: true };
    }
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// =============================================================================
// GET BOOKING FOR CHECKOUT
// =============================================================================

export async function getBookingForCheckout(bookingId: string): Promise<{
  success: boolean;
  data?: BookingWithDetails;
  error?: string;
}> {
  try {
    // Verify user has permission
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const { data: booking, error } = await supabase
      .from("bookings")
      .select(
        `
        *,
        clubs:club_id (
          id,
          name,
          subdomain,
          stripe_account_id
        ),
        courts:court_id (
          id,
          name,
          court_type
        )
      `
      )
      .eq("id", bookingId)
      .eq("user_id", user.id)
      .single();

    if (error || !booking) {
      return { success: false, error: "Booking not found or access denied" };
    }

    return { success: true, data: booking as BookingWithDetails };
  } catch (error) {
    console.error("Error fetching booking for checkout:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// =============================================================================
// SERVER ACTION FOR CHECKOUT
// =============================================================================

/**
 * Server Action for creating checkout session
 * Use this in your form action or API route
 */
export async function createCheckoutSessionAction(formData: FormData) {

  const bookingId = formData.get("bookingId") as string;

  if (!bookingId) {
    return {
      success: false,
      error: "Booking ID is required",
    };
  }

  const result = await createCheckoutSession({ bookingId });

  if (result.success && result.data?.url) {
    // Redirect to Stripe Checkout
    return {
      success: true,
      redirectUrl: result.data.url,
    };
  }

  return result;
}

// =============================================================================
// USAGE EXAMPLES
// =============================================================================

/**
 * Example: Direct function call
 *
 * ```tsx
 * const result = await createCheckoutSession({
 *   bookingId: 'booking-uuid-here'
 * })
 *
 * if (result.success) {
 *   window.location.href = result.data.url
 * } else {
 *   console.error('Checkout failed:', result.error)
 * }
 * ```
 */

/**
 * Example: Server Action in form
 *
 * ```tsx
 * export async function checkoutAction(formData: FormData) {
 *   'use server'
 *
 *   const result = await createCheckoutSessionAction(formData)
 *
 *   if (result.redirectUrl) {
 *     // Redirect to Stripe
 *     redirect(result.redirectUrl)
 *   }
 *
 *   return result
 * }
 * ```
 */

/**
 * Example: React component with client-side call
 *
 * ```tsx
 * async function handleCheckout(bookingId: string) {
 *   const result = await createCheckoutSession({ bookingId })
 *
 *   if (result.success) {
 *     window.location.href = result.data.url
 *   } else {
 *     alert('Payment failed: ' + result.error)
 *   }
 * }
 * ```
 */

// =============================================================================
// CREATE SPLIT CHECKOUT SESSION
// =============================================================================

export async function createSplitCheckoutSession(
  params: CreateSplitCheckoutSessionParams
): Promise<CheckoutSessionResult> {
  try {
    const { bookingId, numberOfSplits, shareId } = params;

    // Verify user has permission (can be a guest, so we check differently)
    // For now, we assume the link is secure. In a real app, you might add more checks.

    // Fetch booking and share details
    const { data: share, error: shareError } = await supabase
      .from("booking_shares")
      .select(
        `
        *,
        bookings (
          *,
          clubs (
            id,
            name,
            subdomain,
            stripe_account_id
          ),
          courts (
            id,
            name,
            court_type
          )
        )
      `
      )
      .eq("id", shareId)
      .single();

    if (shareError || !share || !share.bookings) {
      console.error("Booking share not found:", shareError);
      return { success: false, error: "Payment share not found or invalid." };
    }

    const booking = share.bookings as BookingWithDetails;

    // Validate share status
    if (share.payment_status === "paid") {
      return { success: false, error: "This share has already been paid." };
    }

    // Verify club has Stripe Connect account
    if (!booking.clubs.stripe_account_id) {
      return {
        success: false,
        error:
          "Club has not completed Stripe Connect onboarding. Please contact the club administrator.",
      };
    }

    // Calculate amounts in cents
    const shareAmountCents = Math.round(share.share_amount * 100);
    const serviceFeeCents = Math.round(share.service_fee * 100);

    // Create Stripe Checkout Session
    const checkoutSession = await getStripe().checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Jouw deel voor ${booking.courts.name}`,
              description: `1/${numberOfSplits} deel van de boeking op ${new Date(
                booking.booking_date
              ).toLocaleDateString("nl-NL")}`,
            },
            unit_amount: shareAmountCents,
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "Platform Servicekosten",
              description: "Voor het gebruik van de split-payment functie.",
            },
            unit_amount: serviceFeeCents,
          },
          quantity: 1,
        },
      ],

      // CRUCIAL: Split the payment
      payment_intent_data: {
        // The amount that goes to the club's Stripe account
        transfer_data: {
          destination: booking.clubs.stripe_account_id,
          amount: shareAmountCents,
        },
        // The amount that is kept by our platform
        application_fee_amount: serviceFeeCents,
        metadata: {
          type: "split_payment",
          booking_id: booking.id,
          share_id: share.id,
          club_id: booking.club_id,
        },
      },

      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/pay/success?share_id=${share.id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pay/share/${share.payment_link_token}`,

      metadata: {
        type: "split_payment",
        booking_id: booking.id,
        share_id: share.id,
      },
    });

    console.log("✅ Created split checkout session:", {
      sessionId: checkoutSession.id,
      shareId: share.id,
      bookingId: booking.id,
    });

    return {
      success: true,
      data: {
        sessionId: checkoutSession.id,
        url: checkoutSession.url!,
      },
    };
  } catch (error) {
    console.error("❌ Error creating split checkout session:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

// =============================================================================
// CREATE WALLET TOP-UP SESSION
// =============================================================================

export async function createTopUpSession(params: {
  clubId: string;
  amount: number;
}): Promise<CheckoutSessionResult> {
  try {
    const { clubId, amount } = params;

    // 1. Verify user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // 2. Fetch club details
    const { data: club, error: clubError } = await supabase
      .from("clubs")
      .select("stripe_account_id, name")
      .eq("id", clubId)
      .single();

    if (clubError || !club || !club.stripe_account_id) {
      return {
        success: false,
        error: "Club not found or not configured for payments.",
      };
    }

    // 3. Calculate amounts in cents
    const amountCents = Math.round(amount * 100);
    const applicationFeeCents = Math.round(amountCents * 0.015); // 1.5% platform fee

    // 4. Create Stripe Checkout Session
    const checkoutSession = await getStripe().checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card", "ideal"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Club Tegoed opwaarderen`,
              description: `Voeg €${amount.toFixed(2)} toe aan je wallet voor ${
                club.name
              }.`,
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        transfer_data: {
          destination: club.stripe_account_id,
        },
        application_fee_amount: applicationFeeCents,
        metadata: {
          type: "topup",
          user_id: user.id,
          club_id: clubId,
        },
      },
      customer_email: user.email,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/wallet/success?amount=${amount}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/wallet`,
      metadata: {
        type: "topup",
        user_id: user.id,
        club_id: clubId,
      },
    });

    return {
      success: true,
      data: { sessionId: checkoutSession.id, url: checkoutSession.url! },
    };
  } catch (error) {
    console.error("❌ Error creating top-up session:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
