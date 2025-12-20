"use server";

// Mollie Payment Integration for CourtFlow
// Handles wallet top-ups, bookings, and split payments

import { createMollieClient, PaymentMethod } from '@mollie/api-client';
import { createClient } from "@/utils/supabase/server";

// Initialize Mollie client
let mollieInstance: ReturnType<typeof createMollieClient> | null = null;

function getMollie() {
    if (!mollieInstance) {
        mollieInstance = createMollieClient({
            apiKey: process.env.MOLLIE_API_KEY!
        });
    }
    return mollieInstance;
}

// =============================================================================
// TYPES
// =============================================================================

export interface MolliePaymentResult {
    success: boolean;
    data?: {
        paymentId: string;
        checkoutUrl: string;
    };
    error?: string;
}

// =============================================================================
// CREATE WALLET TOP-UP PAYMENT
// =============================================================================

export async function createMollieTopUpPayment(params: {
    clubId: string;
    amount: number;
}): Promise<MolliePaymentResult> {
    try {
        const { clubId, amount } = params;
        const supabase = createClient();

        // 1. Verify user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { success: false, error: "Not authenticated" };
        }

        // 2. Fetch club details
        const { data: club, error: clubError } = await supabase
            .from("clubs")
            .select("name, subdomain")
            .eq("id", clubId)
            .single();

        if (clubError || !club) {
            return { success: false, error: "Club not found" };
        }

        // 3. Create Mollie payment (no webhook in development - localhost not reachable)
        const payment = await getMollie().payments.create({
            amount: {
                currency: 'EUR',
                value: amount.toFixed(2), // Mollie expects string format "10.00"
            },
            description: `Wallet opwaarderen - ${club.name}`,
            redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/wallet/success?amount=${amount}`,
            metadata: {
                type: 'wallet_topup',
                userId: user.id,
                clubId: clubId,
                amount: amount.toString(),
            },
            method: [PaymentMethod.ideal, PaymentMethod.creditcard, PaymentMethod.bancontact] as PaymentMethod[],
        });

        console.log("✅ Created Mollie payment:", {
            paymentId: payment.id,
            amount: amount,
            userId: user.id,
        });

        return {
            success: true,
            data: {
                paymentId: payment.id,
                checkoutUrl: payment.getCheckoutUrl()!,
            },
        };
    } catch (error) {
        console.error("❌ Error creating Mollie payment:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error occurred",
        };
    }
}

// =============================================================================
// CREATE BOOKING PAYMENT
// =============================================================================

export async function createMollieBookingPayment(params: {
    bookingId: string;
}): Promise<MolliePaymentResult> {
    try {
        const { bookingId } = params;
        const supabase = createClient();

        // 1. Verify user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { success: false, error: "Not authenticated" };
        }

        // 2. Fetch booking details
        const { data: booking, error: bookingError } = await supabase
            .from("bookings")
            .select(`
        *,
        court:courts(name, sport),
        club:clubs(id, name, subdomain)
      `)
            .eq("id", bookingId)
            .eq("user_id", user.id)
            .single();

        if (bookingError || !booking) {
            return { success: false, error: "Booking not found" };
        }

        // 3. Validate booking
        if (booking.payment_status === "paid") {
            return { success: false, error: "Booking already paid" };
        }

        // 4. Create Mollie payment (no webhook in development)
        const payment = await getMollie().payments.create({
            amount: {
                currency: 'EUR',
                value: booking.total_cost.toFixed(2),
            },
            description: `${booking.court.name} - ${booking.booking_date}`,
            redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/${booking.club.subdomain}/booking/success?booking_id=${bookingId}`,
            metadata: {
                type: 'booking',
                bookingId: bookingId,
                userId: user.id,
                clubId: booking.club_id,
                amount: booking.total_cost.toString(),
            },
            method: [PaymentMethod.ideal, PaymentMethod.creditcard, PaymentMethod.bancontact] as PaymentMethod[],
        });

        console.log("✅ Created Mollie booking payment:", {
            paymentId: payment.id,
            bookingId: bookingId,
            amount: booking.total_cost,
        });

        return {
            success: true,
            data: {
                paymentId: payment.id,
                checkoutUrl: payment.getCheckoutUrl()!,
            },
        };
    } catch (error) {
        console.error("❌ Error creating Mollie booking payment:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error occurred",
        };
    }
}

// =============================================================================
// GET PAYMENT STATUS
// =============================================================================

export async function getMolliePaymentStatus(paymentId: string): Promise<{
    success: boolean;
    status?: string;
    error?: string;
}> {
    try {
        const payment = await getMollie().payments.get(paymentId);

        return {
            success: true,
            status: payment.status,
        };
    } catch (error) {
        console.error("❌ Error getting Mollie payment status:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

// =============================================================================
// PROCESS PAYMENT WEBHOOK (Called by Mollie)
// =============================================================================

export async function processMollieWebhook(paymentId: string): Promise<{
    success: boolean;
    error?: string;
}> {
    try {
        const supabase = createClient();

        // 1. Get payment from Mollie
        const payment = await getMollie().payments.get(paymentId);

        if (!payment.metadata) {
            return { success: false, error: "No metadata found" };
        }

        const metadata = payment.metadata as {
            type: string;
            userId: string;
            clubId: string;
            bookingId?: string;
            amount: string;
        };

        // 2. Handle based on payment type
        if (payment.status === 'paid') {
            if (metadata.type === 'wallet_topup') {
                // Add balance to wallet
                const amount = parseFloat(metadata.amount);

                const { data: existingWallet } = await supabase
                    .from('club_wallets')
                    .select('*')
                    .eq('user_id', metadata.userId)
                    .eq('club_id', metadata.clubId)
                    .single();

                if (existingWallet) {
                    await supabase
                        .from('club_wallets')
                        .update({ balance: existingWallet.balance + amount })
                        .eq('user_id', metadata.userId)
                        .eq('club_id', metadata.clubId);
                } else {
                    await supabase
                        .from('club_wallets')
                        .insert({
                            user_id: metadata.userId,
                            club_id: metadata.clubId,
                            balance: amount,
                        });
                }

                console.log("✅ Wallet topped up:", { userId: metadata.userId, amount });
            }
            else if (metadata.type === 'booking' && metadata.bookingId) {
                // Update booking payment status
                await supabase
                    .from('bookings')
                    .update({
                        payment_status: 'paid',
                        status: 'confirmed',
                    })
                    .eq('id', metadata.bookingId);

                console.log("✅ Booking paid:", { bookingId: metadata.bookingId });
            }
        }

        return { success: true };
    } catch (error) {
        console.error("❌ Error processing Mollie webhook:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

// =============================================================================
// CREATE REFUND
// =============================================================================

export async function createMollieRefund(params: {
    paymentId: string;
    amount: number;
}): Promise<{ success: boolean; error?: string; refundId?: string }> {
    try {
        const { paymentId, amount } = params;

        // Create refund via Mollie
        const refund = await getMollie().paymentRefunds.create({
            paymentId: paymentId,
            amount: {
                currency: 'EUR',
                value: amount.toFixed(2),
            },
        });

        console.log("✅ Created Mollie refund:", {
            refundId: refund.id,
            paymentId: paymentId,
            amount: amount,
        });

        return {
            success: true,
            refundId: refund.id,
        };
    } catch (error) {
        console.error("❌ Error creating Mollie refund:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error occurred",
        };
    }
}
