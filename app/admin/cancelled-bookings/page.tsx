import { createClient } from "@/utils/supabase/server";
import { format } from "date-fns";
import { nl } from "date-fns/locale";

export default async function CancelledBookingsPage() {
    const supabase = createClient();

    // Fetch cancelled bookings with financial details
    const { data: cancelledBookings } = await supabase
        .from('bookings')
        .select(`
            *,
            court:courts(name, sport),
            club:clubs(name),
            user:users(email, user_metadata)
        `)
        .not('cancelled_at', 'is', null)
        .order('cancelled_at', { ascending: false });

    // Calculate totals
    const totalCancellations = cancelledBookings?.length || 0;
    const totalFees = cancelledBookings?.reduce((sum, b) => sum + (Number(b.cancellation_fee) || 0), 0) || 0;
    const totalRefunds = cancelledBookings?.reduce((sum, b) => sum + (Number(b.refund_amount) || 0), 0) || 0;
    const totalRevenueLost = cancelledBookings?.reduce((sum, b) => sum + (Number(b.total_price) || 0), 0) || 0;

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">Geannuleerde Boekingen</h1>
                <p className="text-gray-400">Overzicht van alle geannuleerde reserveringen en annuleringskosten</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <p className="text-gray-400 text-xs font-bold uppercase mb-2">Totaal Geannuleerd</p>
                    <p className="text-3xl font-bold text-white">{totalCancellations}</p>
                </div>
                <div className="p-6 rounded-2xl bg-white/5 border border-red-500/20">
                    <p className="text-gray-400 text-xs font-bold uppercase mb-2">Omzet Verloren</p>
                    <p className="text-3xl font-bold text-red-400">€{totalRevenueLost.toFixed(2)}</p>
                </div>
                <div className="p-6 rounded-2xl bg-white/5 border border-green-500/20">
                    <p className="text-gray-400 text-xs font-bold uppercase mb-2">Annuleringskosten</p>
                    <p className="text-3xl font-bold text-green-400">€{totalFees.toFixed(2)}</p>
                </div>
                <div className="p-6 rounded-2xl bg-white/5 border border-blue-500/20">
                    <p className="text-gray-400 text-xs font-bold uppercase mb-2">Restituties</p>
                    <p className="text-3xl font-bold text-blue-400">€{totalRefunds.toFixed(2)}</p>
                </div>
            </div>

            {/* Table */}
            <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-white/10">
                    <h3 className="font-bold text-white text-lg">Annuleringsoverzicht</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-gray-400 font-medium uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">Geannuleerd Op</th>
                                <th className="px-6 py-4">Boeking</th>
                                <th className="px-6 py-4">Gebruiker</th>
                                <th className="px-6 py-4">Beleid</th>
                                <th className="px-6 py-4 text-right">Origineel</th>
                                <th className="px-6 py-4 text-right">Kosten</th>
                                <th className="px-6 py-4 text-right">Restitutie</th>
                                <th className="px-6 py-4">Reden</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {cancelledBookings && cancelledBookings.length > 0 ? (
                                cancelledBookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="text-white font-medium">
                                                {format(new Date(booking.cancelled_at), 'd MMM yyyy', { locale: nl })}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {format(new Date(booking.cancelled_at), 'HH:mm')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-white font-medium">
                                                {format(new Date(booking.booking_date), 'd MMM yyyy', { locale: nl })}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {booking.start_time.slice(0, 5)} - {booking.end_time.slice(0, 5)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-white text-sm">
                                                {booking.user?.user_metadata?.full_name || 'Onbekend'}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {booking.user?.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${booking.cancellation_policy === 'flexible'
                                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                    : booking.cancellation_policy === 'moderate'
                                                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                                }`}>
                                                {booking.cancellation_policy || 'flexible'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono text-gray-300">
                                            €{Number(booking.total_price).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono text-green-400 font-bold">
                                            €{Number(booking.cancellation_fee || 0).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono text-blue-400">
                                            €{Number(booking.refund_amount || 0).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-gray-400 text-xs max-w-xs truncate">
                                            {booking.cancellation_reason || '-'}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                                        Geen geannuleerde boekingen gevonden
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Policy Info */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="font-bold text-white mb-4">Annuleringsbeleid</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                        <p className="font-bold text-green-400 mb-2">🟢 Flexibel</p>
                        <ul className="text-gray-300 space-y-1 text-xs">
                            <li>• Gratis tot 24u voor boeking</li>
                            <li>• 50% kosten binnen 24u</li>
                        </ul>
                    </div>
                    <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                        <p className="font-bold text-yellow-400 mb-2">🟡 Gematigd</p>
                        <ul className="text-gray-300 space-y-1 text-xs">
                            <li>• Gratis tot 48u voor boeking</li>
                            <li>• 50% kosten 24-48u</li>
                            <li>• 100% kosten binnen 24u</li>
                        </ul>
                    </div>
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                        <p className="font-bold text-red-400 mb-2">🔴 Strikt</p>
                        <ul className="text-gray-300 space-y-1 text-xs">
                            <li>• 50% kosten altijd</li>
                            <li>• 100% kosten binnen 48u</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
