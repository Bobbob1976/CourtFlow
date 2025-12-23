
import { createClient } from "@/utils/supabase/server";
import { NextResponse, NextRequest } from "next/server";
import { format } from "date-fns";

// Force dynamic to prevent caching of court status
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const clubId = searchParams.get("clubId");

    if (!clubId) {
        return NextResponse.json({ error: "Missing clubId" }, { status: 400 });
    }

    const supabase = createClient();

    try {
        // 1. Determine Correct Date (NL Timezone)
        const TIMEZONE = 'Europe/Amsterdam';
        const dateFormatter = new Intl.DateTimeFormat('en-CA', { // YYYY-MM-DD
            timeZone: TIMEZONE,
        });
        const dateStr = dateFormatter.format(new Date());

        // 2. Fetch Courts
        const { data: courts, error: courtsError } = await supabase
            .from("courts")
            .select("*")
            .eq("club_id", clubId)
            .order("name");

        if (courtsError) throw courtsError;

        // 3. Fetch Bookings for Date
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
                booking_type,
                title,
                user_profiles(full_name, email, avatar_url, location)
            `)
            .eq("club_id", clubId)
            .eq("booking_date", dateStr) // Use NL date!
            .is("cancelled_at", null);

        if (bookingsError) throw bookingsError;

        // 4. Determine status per court (TimeZone Aware: Europe/Amsterdam)
        // Hacky way to get local time parts
        const nowFormatter = new Intl.DateTimeFormat('en-GB', {
            timeZone: TIMEZONE,
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
        const nowTimeStr = nowFormatter.format(new Date()); // "12:25"
        const [nowH, nowM] = nowTimeStr.split(':').map(Number);
        const currentMinutes = nowH * 60 + nowM;

        const courtStatusList = courts.map((court) => {
            // Filter bookings for this court
            const activeBooking = bookings?.find((booking) => {
                if (booking.court_id !== court.id) return false;
                if (!booking.start_time || !booking.end_time) return false;

                const [startH, startM] = booking.start_time.split(":").map(Number);
                const startMinutes = startH * 60 + startM;

                const [endH, endM] = booking.end_time.split(":").map(Number);
                const endMinutes = endH * 60 + endM;

                // Check overlap
                return currentMinutes >= startMinutes && currentMinutes < endMinutes;
            });

            // Find NEXT booking for today
            const nextBooking = bookings?.filter((booking) => {
                if (booking.court_id !== court.id) return false;
                if (!booking.start_time) return false;

                const [startH, startM] = booking.start_time.split(":").map(Number);
                const startMinutes = startH * 60 + startM;

                return startMinutes > currentMinutes;
            }).sort((a, b) => a.start_time.localeCompare(b.start_time))[0];

            let courtData: any = {
                id: court.id,
                name: court.name,
                status: "available",
                currentBooking: null,
                nextBooking: null,
                maintenanceInfo: null
            };

            if (nextBooking) {
                // @ts-ignore
                const nextProfile = Array.isArray(nextBooking.user_profiles) ? nextBooking.user_profiles[0] : nextBooking.user_profiles;
                // Improved display name logic: Name -> Email Username -> 'Gast'
                const nextName = nextProfile?.full_name || nextProfile?.email?.split('@')[0] || "Gast";

                courtData.nextBooking = {
                    id: nextBooking.id, // Add ID so we can manage it
                    startTime: nextBooking.start_time?.substring(0, 5) || "??:??",
                    player: nextBooking.booking_type === 'maintenance' ? (nextBooking.title || "Onderhoud") : nextName,
                    email: nextProfile?.email,
                    avatar: nextProfile?.avatar_url,
                    type: nextBooking.booking_type // Pass type
                };
            }

            if (activeBooking) {
                // Calculate remaining time safely
                let remainingMinutes = 0;
                let bookingEndStr = activeBooking.end_time?.substring(0, 5) || "??:??";

                if (activeBooking.end_time) {
                    const [endH, endM] = activeBooking.end_time.split(":").map(Number);
                    const endMinutesDay = endH * 60 + endM;
                    remainingMinutes = Math.max(0, endMinutesDay - currentMinutes);
                }

                // @ts-ignore
                const profile = Array.isArray(activeBooking.user_profiles) ? activeBooking.user_profiles[0] : activeBooking.user_profiles;
                const playerName = profile?.full_name || profile?.email?.split('@')[0] || "Gast";

                // Check payment & type
                let status = "occupied";
                if (activeBooking.booking_type === 'maintenance') {
                    status = "maintenance";
                    courtData.maintenanceInfo = {
                        reason: activeBooking.title || "Gepland Onderhoud",
                        estimatedEnd: bookingEndStr
                    };
                } else if (activeBooking.payment_status === "pending") {
                    status = "payment_pending";
                }

                courtData.status = status;
                courtData.currentBooking = {
                    id: activeBooking.id,
                    startTime: activeBooking.start_time?.substring(0, 5) || "??:??",
                    endTime: bookingEndStr,
                    remainingMinutes: Math.max(0, remainingMinutes),
                    players: [{
                        name: playerName,
                        email: profile?.email,
                        avatar: profile?.avatar_url,
                        location: profile?.location
                    }],
                    paymentStatus: activeBooking.payment_status,
                    type: activeBooking.booking_type
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
