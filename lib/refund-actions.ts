"use server";

import { createClient } from "@/utils/supabase/server";

/**
 * Create a refund for a booking
 */
export async function createBookingRefund(bookingId: string, reason?: string) {
    try {
        const supabase = createClient();

        // 1. Verify admin/user permissions
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { success: false, error: "Not authenticated" };
        }

        // 2. Get booking details
        const { data: booking, error: bookingError } = await supabase
            .from("bookings")
            .select("*, court:courts(name)")
            .eq("id", bookingId)
            .single();

        if (bookingError || !booking) {
            return { success: false, error: "Booking not found" };
        }

        // 3. Validate refund eligibility
        if (booking.payment_status !== "paid") {
            return { success: false, error: "Booking not paid yet" };
        }

        if (booking.cancelled_at) {
            return { success: false, error: "Booking already cancelled" };
        }

        // 4. Calculate refund amount (could apply cancellation fees here)
        const refundAmount = booking.total_cost;

        // 5. Create Mollie refund (if payment was via Mollie)
        if (process.env.MOLLIE_API_KEY && booking.mollie_payment_id) {
            const { createMollieRefund } = await import("@/lib/mollie-actions");
            const refundResult = await createMollieRefund({
                paymentId: booking.mollie_payment_id,
                amount: refundAmount,
            });

            if (!refundResult.success) {
                return { success: false, error: "Mollie refund failed: " + refundResult.error };
            }
        }

        // 6. Update booking status
        await supabase
            .from("bookings")
            .update({
                payment_status: "refunded",
                cancelled_at: new Date().toISOString(),
                cancellation_reason: reason || "Refund requested",
            })
            .eq("id", bookingId);

        // 7. Create refund record
        await supabase
            .from("refunds")
            .insert({
                booking_id: bookingId,
                user_id: booking.user_id,
                club_id: booking.club_id,
                amount: refundAmount,
                reason: reason || "Refund requested",
                status: "completed",
                processed_by: user.id,
            });

        console.log("✅ Refund created:", { bookingId, amount: refundAmount });

        return {
            success: true,
            refundAmount: refundAmount,
        };

    } catch (error) {
        console.error("❌ Refund error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Get refund history for a club
 */
export async function getRefundHistory(clubId: string) {
    try {
        const supabase = createClient();

        const { data: refunds, error } = await supabase
            .from("refunds")
            .select(`
        *,
        booking:bookings(booking_date, start_time, court:courts(name)),
        user:user_profiles(full_name)
      `)
            .eq("club_id", clubId)
            .order("created_at", { ascending: false })
            .limit(100);

        if (error) {
            return { success: false, error: error.message };
        }

        return {
            success: true,
            refunds: refunds || [],
        };

    } catch (error) {
        console.error("❌ Get refund history error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}
