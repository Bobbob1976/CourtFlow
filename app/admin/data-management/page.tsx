import { backfillOccupancyHistory } from "@/lib/occupancy-actions";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function DataManagementPage() {
    const supabase = createClient();

    // Get occupancy history stats
    const { data: stats } = await supabase
        .from('court_occupancy_history')
        .select('*')
        .eq('club_id', '90f93d47-b438-427c-8b33-0597817c1d96');

    const totalRecords = stats?.length || 0;
    const avgOccupancy = stats?.reduce((sum, s) => sum + s.occupancy_rate, 0) / (totalRecords || 1);
    const totalRevenue = stats?.reduce((sum, s) => sum + (s.total_revenue || 0), 0) || 0;

    async function runBackfill(formData: FormData) {
        "use server";
        const days = parseInt(formData.get('days') as string) || 90;
        await backfillOccupancyHistory('90f93d47-b438-427c-8b33-0597817c1d96', days);
        redirect('/admin/data-management?success=true');
    }

    return (
        <div className="p-6 space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">Data Management</h1>
                <p className="text-gray-400">Manage historical data for AI forecasting</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <p className="text-gray-400 text-xs font-bold uppercase mb-2">Historical Records</p>
                    <p className="text-3xl font-bold text-blue-400">{totalRecords}</p>
                    <p className="text-xs text-gray-500 mt-1">Occupancy data points</p>
                </div>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <p className="text-gray-400 text-xs font-bold uppercase mb-2">Avg Occupancy</p>
                    <p className="text-3xl font-bold text-green-400">{avgOccupancy.toFixed(1)}%</p>
                    <p className="text-xs text-gray-500 mt-1">Across all time slots</p>
                </div>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <p className="text-gray-400 text-xs font-bold uppercase mb-2">Total Revenue</p>
                    <p className="text-3xl font-bold text-purple-400">€{totalRevenue.toFixed(2)}</p>
                    <p className="text-xs text-gray-500 mt-1">From historical data</p>
                </div>
            </div>

            {/* Backfill Tool */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Backfill Historical Data</h2>
                <p className="text-gray-400 mb-6">
                    Populate occupancy history from existing bookings. This improves forecast accuracy.
                </p>

                <form action={runBackfill} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-white mb-2">
                            Days to backfill
                        </label>
                        <select
                            name="days"
                            className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white w-full max-w-xs"
                        >
                            <option value="30">Last 30 days</option>
                            <option value="60">Last 60 days</option>
                            <option value="90" selected>Last 90 days</option>
                            <option value="180">Last 6 months</option>
                            <option value="365">Last year</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition-colors"
                    >
                        Run Backfill
                    </button>
                </form>

                <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                    <p className="text-yellow-400 text-sm">
                        ⚠️ <strong>Note:</strong> This process may take a few seconds depending on the number of bookings.
                    </p>
                </div>
            </div>

            {/* Recent History Preview */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-white/10">
                    <h2 className="text-xl font-bold text-white">Recent Historical Data</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-gray-400 font-medium uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Hour</th>
                                <th className="px-6 py-4">Day</th>
                                <th className="px-6 py-4">Occupancy</th>
                                <th className="px-6 py-4">Bookings</th>
                                <th className="px-6 py-4">Revenue</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {stats?.slice(0, 10).map((record) => (
                                <tr key={record.id} className="hover:bg-white/5">
                                    <td className="px-6 py-4 text-white">{record.date}</td>
                                    <td className="px-6 py-4 text-gray-300">{record.hour}:00</td>
                                    <td className="px-6 py-4 text-gray-300">
                                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][record.day_of_week]}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-green-400 font-bold">{record.occupancy_rate}%</span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-300">{record.total_bookings}</td>
                                    <td className="px-6 py-4 text-white font-mono">€{record.total_revenue?.toFixed(2) || '0.00'}</td>
                                </tr>
                            ))}
                            {(!stats || stats.length === 0) && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No historical data yet. Run backfill to populate.
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
