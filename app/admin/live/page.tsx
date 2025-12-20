import { createClient } from "@/utils/supabase/server";
import { format } from "date-fns";
import CourtGridItem from "@/components/admin/CourtGridItem";

export default async function AdminLivePage() {
    const supabase = createClient();

    // 1. Fetch all courts
    const { data: courts } = await supabase
        .from("courts")
        .select("*, club:clubs(name)")
        .order("name");

    // 2. Fetch active bookings for NOW
    const now = new Date();
    const currentDate = format(now, "yyyy-MM-dd");
    const currentTime = format(now, "HH:mm:ss");

    const { data: activeBookings } = await supabase
        .from("bookings")
        .select("*, user:user_profiles(full_name)")
        .eq("booking_date", currentDate)
        .lte("start_time", currentTime)
        .gte("end_time", currentTime)
        .eq("status", "confirmed");

    // 3. Map status
    const courtsWithStatus = courts?.map(court => {
        const booking = activeBookings?.find(b => b.court_id === court.id);

        // If court is in maintenance in DB, it overrides booking status for display
        // But logically, if there's a booking, it shouldn't be in maintenance or vice versa.
        // For display priority: Maintenance > Active Booking > Empty

        let displayStatus = 'empty';
        if (court.status === 'maintenance') {
            displayStatus = 'maintenance';
        } else if (booking) {
            displayStatus = 'active';
        }

        return {
            ...court,
            status: displayStatus, // This status is for UI display logic
            dbStatus: court.status, // Actual DB status
            currentBooking: booking
        };
    }) || [];

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">Live Court View</h1>
                <div className="flex gap-2">
                    <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        {activeBookings?.length || 0} Active
                    </span>
                    <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400">
                        <span className="w-2 h-2 rounded-full bg-gray-600"></span>
                        {(courts?.length || 0) - (activeBookings?.length || 0)} Empty
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {courtsWithStatus.map((court) => (
                    <CourtGridItem key={court.id} court={court} />
                ))}
            </div>
        </div>
    );
}
