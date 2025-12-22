
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
                booking_date,
                start_time,
                end_time,
                payment_status,
                user_id,
                user_profiles ( full_name )
            `)
            .eq("club_id", clubId)
            .eq("booking_date", format(now, "yyyy-MM-dd")) // Only today
            .is("cancelled_at", null);

        if (bookingsError) throw bookingsError;

        // 3. Map status for each court
        const courtStatusList = courts.map((court) => {
            // Find a booking that is actively happening NOW on this court
            const activeBooking = bookings?.find((booking) => {
                if (booking.court_id !== court.id) return false;
                if (!booking.start_time || !booking.end_time) return false;

                // Parse times
                const [startH, startM] = booking.start_time.split(":").map(Number);
                const [endH, endM] = booking.end_time.split(":").map(Number);

                const bookingStart = new Date(now);
                bookingStart.setHours(startH, startM, 0, 0);

                const bookingEnd = new Date(now);
                bookingEnd.setHours(endH, endM, 0, 0);

                // Check overlap
                return now >= bookingStart && now < bookingEnd;
            });

            // Find NEXT booking for today
            const nextBooking = bookings?.filter((booking) => {
                if (booking.court_id !== court.id) return false;
                if (!booking.start_time) return false;

                const [startH, startM] = booking.start_time.split(":").map(Number);
                const bookingStart = new Date(now);
                bookingStart.setHours(startH, startM, 0, 0);

                return bookingStart > now;
            }).sort((a, b) => a.start_time.localeCompare(b.start_time))[0];

            let courtData: any = {
                id: court.id,
                name: court.name,
                status: "available",
                currentBooking: null,
                nextBooking: null
            };

            if (nextBooking) {
                // @ts-ignore
                const nextProfile = Array.isArray(nextBooking.user_profiles) ? nextBooking.user_profiles[0] : nextBooking.user_profiles;
                const nextName = nextProfile?.full_name || "Gast";

                courtData.nextBooking = {
                    startTime: nextBooking.start_time?.substring(0, 5) || "??:??",
                    player: nextName
                };
            }

            if (activeBooking) {
                // Calculate remaining time safely
                let remainingMinutes = 0;
                let bookingEndStr = activeBooking.end_time?.substring(0, 5) || "??:??";

                if (activeBooking.end_time) {
                    const [endH, endM] = activeBooking.end_time.split(":").map(Number);
                    const bookingEnd = new Date(now);
                    bookingEnd.setHours(endH, endM, 0, 0);
                    remainingMinutes = differenceInMinutes(bookingEnd, now);
                }

                // Get player name comfortably
                // Handle array or object result from join
                // @ts-ignore
                const profileData = Array.isArray(activeBooking.user_profiles) ? activeBooking.user_profiles[0] : activeBooking.user_profiles;
                const playerName = profileData?.full_name || "Gast";

                // Check payment
                let status = "occupied";
                if (activeBooking.payment_status === "pending") {
                    status = "payment_pending";
                }

                courtData.status = status;
                courtData.currentBooking = {
                    id: activeBooking.id,
                    startTime: activeBooking.start_time?.substring(0, 5) || "??:??",
                    endTime: bookingEndStr,
                    remainingMinutes: Math.max(0, remainingMinutes),
                    players: [{ name: playerName }],
                    paymentStatus: activeBooking.payment_status
                };
            }

            return courtData;
        });

        return NextResponse.json({ courts: courtStatusList });

    } catch (error: any) {
        console.error("Error fetching court status:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
