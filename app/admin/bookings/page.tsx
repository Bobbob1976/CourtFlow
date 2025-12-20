import { createClient } from "@/utils/supabase/server";
import { format } from "date-fns";
import { nl } from "date-fns/locale";

export default async function AdminBookingsPage() {
    const supabase = createClient();

    // Fetch bookings with relations (filtered by demo club for now)
    const { data: bookings, error } = await supabase
        .from("bookings")
        .select(`
            *,
            court:courts(name, sport),
            club:clubs(name)
        `)
        .eq('club_id', '90f93d47-b438-427c-8b33-0597817c1d96') // Demo club
        .is('cancelled_at', null) // Exclude cancelled bookings
        .order("booking_date", { ascending: false })
        .order("start_time", { ascending: false })
        .limit(50);

    console.log('Admin bookings query:', { count: bookings?.length, error });

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white">Bookings Management</h1>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Search bookings..."
                        className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                    <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                        Export CSV
                    </button>
                </div>
            </div>

            <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-gray-400 font-medium uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Date & Time</th>
                                <th className="px-6 py-4">Court</th>
                                <th className="px-6 py-4">Player</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {bookings?.map((booking) => (
                                <BookingRow key={booking.id} booking={booking} />
                            ))}
                            {(!bookings || bookings.length === 0) && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No bookings found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function BookingRow({ booking }: { booking: any }) {
    const date = new Date(booking.booking_date);
    const statusColors: any = {
        confirmed: "bg-green-500/10 text-green-400 border-green-500/20",
        cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
        pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    };

    return (
        <tr className="hover:bg-white/5 transition-colors group">
            <td className="px-6 py-4">
                <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${statusColors[booking.status] || "bg-gray-500/10 text-gray-400"}`}>
                    {booking.status.toUpperCase()}
                </span>
            </td>
            <td className="px-6 py-4">
                <div className="font-bold text-white">{format(date, "d MMM yyyy", { locale: nl })}</div>
                <div className="text-gray-500 font-mono text-xs">
                    {booking.start_time.slice(0, 5)} - {booking.end_time.slice(0, 5)}
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="text-white">{booking.court?.name}</div>
                <div className="text-gray-500 text-xs">{booking.court?.sport}</div>
            </td>
            <td className="px-6 py-4">
                <div className="text-white font-mono text-xs">{booking.user_id.slice(0, 8)}...</div>
                <div className="text-gray-500 text-xs">{booking.attendees} spelers</div>
            </td>
            <td className="px-6 py-4 font-mono text-white">
                €{booking.total_cost}
            </td>
            <td className="px-6 py-4 text-right">
                <button className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
                    </svg>
                </button>
            </td>
        </tr>
    )
}
