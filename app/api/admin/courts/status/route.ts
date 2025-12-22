
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { format, addMinutes, differenceInMinutes, parseISO } from "date-fns";
import { nl } from "date-fns/locale";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const clubId = searchParams.get("clubId");

    if (!clubId) {
        return NextResponse.json({ error: "Missing clubId" }, { status: 400 });
    }

    const supabase = createClient();

    try {
        // 1. Fetch all courts for this club
        const { data: courts, error: courtsError } = await supabase
            .from("courts")
            .select("id, name")
            .eq("club_id", clubId)
            .order("name");

        if (courtsError) throw courtsError;

        // 2. Fetch Active Bookings (where NOW is between start_time and end_time)
        // We use a broader range to catch all bookings for today to be safe, then filter in JS
        // Or strictly check time overlap in SQL. Let's filter in JS for flexibility.
        const now = new Date();
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);

        const { data: bookings, error: bookingsError } = await supabase
            .from("bookings")
            .select(`
                id,
                court_id,
                date,
                start_time,
                duration,
                payment_status,
                user_id,
                profiles:user_id ( full_name, email )
            `)
            .eq("club_id", clubId)
            .eq("date", format(now, "yyyy-MM-dd")) // Only today
            .is("cancelled_at", null);

        if (bookingsError) throw bookingsError;

        // 3. Map status for each court
        const courtStatusList = courts.map((court) => {
            // Find a booking that is actively happening NOW on this court
            const activeBooking = bookings?.find((booking) => {
                if (booking.court_id !== court.id) return false;
                if (!booking.start_time) return false;

                // Parse time safely
                const timeParts = booking.start_time.split(":");
                if (timeParts.length < 2) return false;

                const [hours, minutes] = timeParts.map(Number);
                const bookingStart = new Date(now);
                bookingStart.setHours(hours, minutes, 0, 0);

                const bookingEnd = addMinutes(bookingStart, booking.duration || 60);

                // Check overlap
                return now >= bookingStart && now < bookingEnd;
            });

            if (activeBooking) {
                // Calculate remaining time safely
                let remainingMinutes = 0;
                let bookingEndStr = "??:??";

                if (activeBooking.start_time) {
                    const [hours, minutes] = activeBooking.start_time.split(":").map(Number);
                    const bookingStart = new Date(now);
                    bookingStart.setHours(hours, minutes, 0, 0);
                    const bookingEnd = addMinutes(bookingStart, activeBooking.duration || 60);
                    remainingMinutes = differenceInMinutes(bookingEnd, now);
                    bookingEndStr = format(bookingEnd, "HH:mm");
                }

                // Get player name comfortably
                // Handle array or object result from join
                const profileData = Array.isArray(activeBooking.profiles) ? activeBooking.profiles[0] : activeBooking.profiles;
                const playerName = profileData?.full_name || profileData?.email || "Gast";

                // Check payment
                let status = "occupied";
                if (activeBooking.payment_status === "pending") {
                    status = "payment_pending";
                }

                return {
                    id: court.id,
                    name: court.name,
                    status: status,
                    currentBooking: {
                        id: activeBooking.id,
                        startTime: activeBooking.start_time?.substring(0, 5) || "??:??",
                        endTime: bookingEndStr,
                        remainingMinutes: Math.max(0, remainingMinutes),
                        players: [{ name: playerName }],
                        paymentStatus: activeBooking.payment_status
                    }
                };
            }

            // No active booking -> Available
            return {
                id: court.id,
                name: court.name,
                status: "available"
            };
        });

        return NextResponse.json({ courts: courtStatusList });

    } catch (error: any) {
        console.error("Error fetching court status:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
