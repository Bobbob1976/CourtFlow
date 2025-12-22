
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { format, addDays } from "date-fns";
import { nl } from "date-fns/locale";

export async function GET() {
    const supabase = createClient();

    try {
        // Fetch club (simple fetch, assuming single club context for now)
        // In real multi-tenant, get clubId from query params or auth context
        const { data: clubs } = await supabase.from('clubs').select('id').limit(1);
        const clubId = clubs?.[0]?.id;

        if (!clubId) {
            return NextResponse.json({ days: [] });
        }

        // Get forecasts for next 7 days
        const responseData = [];
        const today = new Date();

        for (let i = 0; i < 7; i++) {
            const targetDate = addDays(today, i);
            const dateStr = format(targetDate, "yyyy-MM-dd");
            const dayLabel = format(targetDate, "EEEE", { locale: nl }); // maandag, dinsdag...

            // Count bookings for this day
            const { count } = await supabase
                .from("bookings")
                .select("*", { count: 'exact', head: true })
                .eq("club_id", clubId)
                .eq("booking_date", dateStr)
                .is("cancelled_at", null);

            // Determine "busyness" label logic (mock logic based on real count)
            // Example: < 10 = rustig, 10-20 = normaal, > 20 = druk
            let status = "Rustig";
            let color = "green";
            if ((count || 0) > 10) { status = "Normaal"; color = "blue"; }
            if ((count || 0) > 25) { status = "Druk"; color = "orange"; }

            responseData.push({
                day: i === 0 ? "Vandaag" : i === 1 ? "Morgen" : dayLabel,
                date: dateStr,
                count: count || 0,
                status: status,
                color: color
            });
        }

        return NextResponse.json({ days: responseData });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
