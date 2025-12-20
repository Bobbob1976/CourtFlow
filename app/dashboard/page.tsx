import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import DashboardClient from "@/components/dashboard/DashboardClient";

export default async function DashboardPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch bookings with joined court and club data
    const { data: bookings, error } = await supabase
        .from("bookings")
        .select(`
            *,
            court:courts (
                name,
                sport
            ),
            club:clubs (
                id,
                name,
                subdomain
            ),
            matches (
                id
            )
        `)
        .eq("user_id", user.id)
        .order("booking_date", { ascending: false })
        .order("start_time", { ascending: false });

    if (error) {
        console.error("Error fetching bookings:", error);
    } else {
        console.log("Fetched bookings:", bookings?.length, bookings);
    }

    // Fetch user profile for stats (mocked for now if not in DB)
    // In a real scenario, we'd fetch stats from a 'player_stats' table
    const playerStats = [
        { subject: 'Power', A: 85, fullMark: 100 },
        { subject: 'Control', A: 78, fullMark: 100 },
        { subject: 'Speed', A: 92, fullMark: 100 },
        { subject: 'Stamina', A: 65, fullMark: 100 },
        { subject: 'Tactics', A: 70, fullMark: 100 },
        { subject: 'Mental', A: 88, fullMark: 100 },
    ];

    return (
        <div className="min-h-screen bg-[#121212] text-white">
            <DashboardClient user={user} stats={playerStats} bookings={bookings || []} />
        </div>
    );
}
