"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function createAtomicBooking(formData: FormData) {
    const clubId = formData.get("clubId") as string;
    const courtId = formData.get("courtId") as string;
    const userId = formData.get("userId") as string;
    const bookingDate = formData.get("bookingDate") as string;
    const startTime = formData.get("startTime") as string;
    const endTime = formData.get("endTime") as string;
    const attendees = parseInt(formData.get("attendees") as string || "4");

    // New fields
    const isPublicMatch = formData.get("isPublicMatch") === "true";
    const lookingForPlayers = parseInt(formData.get("lookingForPlayers") as string || "3");
    const splitPayment = formData.get("splitPayment") === "true";

    const supabase = createClient();

    // 1. Fetch court details for pricing
    const { data: court } = await supabase
        .from("courts")
        .select("hourly_rate")
        .eq("id", courtId)
        .single();

    if (!court) {
        throw new Error("Court not found");
    }

    // 2. Calculate duration and total price
    const start = new Date(`1970-01-01T${startTime}`);
    const end = new Date(`1970-01-01T${endTime}`);
    const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

    if (durationHours <= 0) {
        redirect(`/?message=Eindtijd moet na starttijd liggen`);
    }

    const totalPrice = durationHours * court.hourly_rate;

    const { data: booking, error } = await supabase.rpc("create_atomic_booking", {
        p_club_id: clubId,
        p_court_id: courtId,
        p_user_id: userId,
        p_booking_date: bookingDate,
        p_start_time: startTime,
        p_end_time: endTime,
        p_total_price: totalPrice,
        p_attendees: attendees,
    });

    if (error) {
        console.error("Booking error:", error);
        redirect(`/?message=Boeking mislukt: ${error.message}`);
    }

    // 3. Handle Open Match
    if (isPublicMatch) {
        await supabase.from("matches").insert({
            booking_id: booking.id,
            host_id: userId,
            club_id: clubId,
            looking_for_players: lookingForPlayers,
            is_public: true,
            status: "open",
            match_type: "friendly", // Default
        });

        // Add host as player
        const { data: match } = await supabase
            .from("matches")
            .select("id")
            .eq("booking_id", booking.id)
            .single();

        if (match) {
            await supabase.from("match_players").insert({
                match_id: match.id,
                user_id: userId,
                status: "confirmed",
                team: 1
            });
        }
    }

    // 4. Handle Split Payment (Create shares)
    if (splitPayment) {
        console.log("Processing split payment...");
        const shareAmount = totalPrice / attendees;
        const shares = Array.from({ length: attendees }, (_, i) => ({
            booking_id: booking.id,
            share_amount: shareAmount,
            service_fee: 0.25,
            total_amount: shareAmount + 0.25,
            share_number: i + 1,
        }));

        await supabase.from("booking_shares").insert(shares);
    }

    // 5. Create Mollie payment (if Mollie is enabled)
    if (process.env.MOLLIE_API_KEY) {
        console.log("Creating Mollie payment for booking:", booking.id);
        const { createMollieBookingPayment } = await import("@/lib/mollie-actions");
        const paymentResult = await createMollieBookingPayment({ bookingId: booking.id });

        if (paymentResult.success && paymentResult.data?.checkoutUrl) {
            console.log("Redirecting to Mollie checkout:", paymentResult.data.checkoutUrl);
            redirect(paymentResult.data.checkoutUrl);
        } else {
            console.error("Mollie payment creation failed:", paymentResult.error);
            // Continue to dashboard even if payment fails
        }
    }

    console.log("Redirecting to dashboard...");
    // Redirect to the dashboard page
    redirect(`/dashboard?newBooking=${booking.id}`);
}
