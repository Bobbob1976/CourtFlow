import { createClient } from "@/utils/supabase/server";
import { format } from "date-fns";
import { nl } from "date-fns/locale";

export default async function AdminPaymentsPage() {
    const supabase = createClient();

    // Get all bookings with payment info
    const { data: bookings } = await supabase
        .from("bookings")
        .select(`
      *,
      court:courts(name, sport),
      user:user_profiles(full_name)
    `)
        .eq('club_id', '90f93d47-b438-427c-8b33-0597817c1d96')
        .order("created_at", { ascending: false })
        .limit(100);

    // Calculate stats
    const totalRevenue = bookings?.reduce((sum, b) => sum + (b.payment_status === 'paid' ? b.total_cost : 0), 0) || 0;
    const pendingRevenue = bookings?.reduce((sum, b) => sum + (b.payment_status === 'pending' ? b.total_cost : 0), 0) || 0;
    const paidCount = bookings?.filter(b => b.payment_status === 'paid').length || 0;
    const pendingCount = bookings?.filter(b => b.payment_status === 'pending').length || 0;

    return (
        <div className="p-6 space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">Payment Management</h1>
                <p className="text-gray-400">Track and manage all payments</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <p className="text-gray-400 text-xs font-bold uppercase mb-2">Total Revenue</p>
                    <p className="text-3xl font-bold text-green-400">€{totalRevenue.toFixed(2)}</p>
                    <p className="text-xs text-gray-500 mt-1">{paidCount} paid bookings</p>
                </div>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <p className="text-gray-400 text-xs font-bold uppercase mb-2">Pending Revenue</p>
                    <p className="text-3xl font-bold text-yellow-400">€{pendingRevenue.toFixed(2)}</p>
                    <p className="text-xs text-gray-500 mt-1">{pendingCount} pending</p>
                </div>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <p className="text-gray-400 text-xs font-bold uppercase mb-2">Success Rate</p>
                    <p className="text-3xl font-bold text-blue-400">
                        {((paidCount / (bookings?.length || 1)) * 100).toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Payment completion</p>
                </div>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <p className="text-gray-400 text-xs font-bold uppercase mb-2">Total Bookings</p>
                    <p className="text-3xl font-bold text-purple-400">{bookings?.length || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">All time</p>
                </div>
            </div>

            {/* Payments Table */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Recent Payments</h2>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-bold transition-colors">
                            Filter
                        </button>
                        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold transition-colors">
                            Export CSV
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-gray-400 font-medium uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Court</th>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Method</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {bookings?.map((booking) => (
                                <PaymentRow key={booking.id} booking={booking} />
                            ))}
                            {(!bookings || bookings.length === 0) && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        No payments found.
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

function PaymentRow({ booking }: { booking: any }) {
    const statusColors: any = {
        paid: "bg-green-500/10 text-green-400 border-green-500/20",
        pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
        failed: "bg-red-500/10 text-red-400 border-red-500/20",
        refunded: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    };

    return (
        <tr className="hover:bg-white/5 transition-colors">
            <td className="px-6 py-4">
                <div className="text-white font-bold">{booking.booking_date}</div>
                <div className="text-gray-500 text-xs">
                    {booking.start_time.slice(0, 5)} - {booking.end_time.slice(0, 5)}
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="text-white">{booking.court?.name}</div>
                <div className="text-gray-500 text-xs">{booking.court?.sport}</div>
            </td>
            <td className="px-6 py-4">
                <div className="text-white">{booking.user?.full_name || 'Unknown'}</div>
                <div className="text-gray-500 text-xs font-mono">{booking.user_id.slice(0, 8)}...</div>
            </td>
            <td className="px-6 py-4">
                <div className="text-white font-mono font-bold">€{booking.total_cost}</div>
            </td>
            <td className="px-6 py-4">
                <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${statusColors[booking.payment_status] || "bg-gray-500/10 text-gray-400"}`}>
                    {booking.payment_status.toUpperCase()}
                </span>
            </td>
            <td className="px-6 py-4">
                <div className="text-gray-400 text-xs">
                    {booking.payment_method || 'Mollie'}
                </div>
            </td>
            <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                    {booking.payment_status === 'paid' && (
                        <button className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg" title="Refund">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                                <path d="M3 3v5h5" />
                            </svg>
                        </button>
                    )}
                    <button className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg" title="Details">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    );
}
