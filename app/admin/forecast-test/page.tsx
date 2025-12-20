import { createClient } from "@/utils/supabase/server";
import { getCurrentWeather } from "@/lib/weather-service";

export default async function ForecastTestPage() {
    const supabase = createClient();
    const clubId = '90f93d47-b438-427c-8b33-0597817c1d96';

    // Get current weather
    const weather = await getCurrentWeather('Amsterdam');

    // Get historical data stats
    const { data: historyStats } = await supabase
        .from('court_occupancy_history')
        .select('*')
        .eq('club_id', clubId);

    // Get latest predictions
    const { data: predictions } = await supabase
        .from('occupancy_predictions')
        .select('*')
        .eq('club_id', clubId)
        .order('created_at', { ascending: false })
        .limit(10);

    // Calculate average occupancy by day of week
    const avgByDay = Array.from({ length: 7 }, (_, day) => {
        const dayData = historyStats?.filter(h => h.day_of_week === day) || [];
        const avg = dayData.reduce((sum, d) => sum + d.occupancy_rate, 0) / (dayData.length || 1);
        return {
            day: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day],
            avg: avg.toFixed(1),
            count: dayData.length
        };
    });

    // Calculate average occupancy by hour
    const avgByHour = Array.from({ length: 24 }, (_, hour) => {
        const hourData = historyStats?.filter(h => h.hour === hour) || [];
        const avg = hourData.reduce((sum, d) => sum + d.occupancy_rate, 0) / (hourData.length || 1);
        return {
            hour: `${hour}:00`,
            avg: avg.toFixed(1),
            count: hourData.length
        };
    });

    return (
        <div className="p-6 space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">Forecast Test Dashboard</h1>
                <p className="text-gray-400">Debug and test the AI forecasting system</p>
            </div>

            {/* Weather Status */}
            <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Current Weather (Amsterdam)</h2>
                {weather ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-gray-400 text-sm">Condition</p>
                            <p className="text-2xl font-bold text-white capitalize">{weather.condition}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Temperature</p>
                            <p className="text-2xl font-bold text-white">{weather.temperature}°C</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Precipitation</p>
                            <p className="text-2xl font-bold text-white">{weather.precipitation.toFixed(1)} mm</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Wind Speed</p>
                            <p className="text-2xl font-bold text-white">{weather.windSpeed.toFixed(1)} m/s</p>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-400">Weather data unavailable</p>
                )}
            </div>

            {/* Historical Data Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <p className="text-gray-400 text-xs font-bold uppercase mb-2">Total Data Points</p>
                    <p className="text-3xl font-bold text-blue-400">{historyStats?.length || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">Historical records</p>
                </div>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <p className="text-gray-400 text-xs font-bold uppercase mb-2">Avg Occupancy</p>
                    <p className="text-3xl font-bold text-green-400">
                        {(historyStats?.reduce((sum, h) => sum + h.occupancy_rate, 0) / (historyStats?.length || 1)).toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">All time slots</p>
                </div>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <p className="text-gray-400 text-xs font-bold uppercase mb-2">Predictions Made</p>
                    <p className="text-3xl font-bold text-purple-400">{predictions?.length || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">Recent forecasts</p>
                </div>
            </div>

            {/* Occupancy by Day of Week */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Average Occupancy by Day</h2>
                <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
                    {avgByDay.map((day) => (
                        <div key={day.day} className="text-center p-4 bg-white/5 rounded-xl">
                            <p className="text-gray-400 text-xs mb-2">{day.day.slice(0, 3)}</p>
                            <p className="text-2xl font-bold text-white">{day.avg}%</p>
                            <p className="text-xs text-gray-500 mt-1">{day.count} records</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Occupancy by Hour */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Average Occupancy by Hour</h2>
                <div className="grid grid-cols-4 md:grid-cols-12 gap-2">
                    {avgByHour.filter(h => parseInt(h.hour) >= 8 && parseInt(h.hour) <= 22).map((hour) => (
                        <div key={hour.hour} className="text-center p-3 bg-white/5 rounded-lg">
                            <p className="text-gray-400 text-xs mb-1">{hour.hour}</p>
                            <p className="text-lg font-bold text-white">{hour.avg}%</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Predictions */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-white/10">
                    <h2 className="text-xl font-bold text-white">Recent Predictions</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-gray-400 font-medium uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Hour</th>
                                <th className="px-6 py-4">Predicted</th>
                                <th className="px-6 py-4">Confidence</th>
                                <th className="px-6 py-4">Factors</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {predictions?.map((pred) => (
                                <tr key={pred.id} className="hover:bg-white/5">
                                    <td className="px-6 py-4 text-white">{pred.prediction_date}</td>
                                    <td className="px-6 py-4 text-gray-300">{pred.hour}:00</td>
                                    <td className="px-6 py-4">
                                        <span className="text-green-400 font-bold">{pred.predicted_occupancy}%</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-blue-400">{pred.confidence_level}%</span>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-gray-400">
                                        {pred.factors?.weather || 'N/A'} • {pred.factors?.dayType || 'N/A'}
                                    </td>
                                </tr>
                            ))}
                            {(!predictions || predictions.length === 0) && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        No predictions yet. Visit the dashboard to generate forecasts.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Test Actions */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">🧪 Test Actions</h2>
                <div className="space-y-3">
                    <a
                        href="/admin/dashboard"
                        className="block bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition-colors text-center"
                    >
                        View Dashboard (Generates Forecast)
                    </a>
                    <a
                        href="/admin/data-management"
                        className="block bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl font-bold transition-colors text-center"
                    >
                        Manage Historical Data
                    </a>
                    <a
                        href="/api/admin/forecast?clubId=90f93d47-b438-427c-8b33-0597817c1d96"
                        target="_blank"
                        className="block bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-xl font-bold transition-colors text-center"
                    >
                        Test Forecast API (JSON)
                    </a>
                </div>
            </div>
        </div>
    );
}
