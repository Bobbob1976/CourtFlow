"use client";

import { useEffect, useState } from "react";

interface ForecastData {
    predictedOccupancy: number;
    trend: 'low' | 'medium' | 'high';
    weatherFactor: string;
    weatherIcon: string;
    confidence: number;
    historicalAverage: number;
}

export default function ForecastWidget() {
    const [forecast, setForecast] = useState<ForecastData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate forecast calculation
        // In production, this would call an API that:
        // 1. Fetches historical booking data
        // 2. Calls weather API
        // 3. Runs ML model or statistical analysis

        setTimeout(() => {
            // Mock data - replace with real API call
            const historicalAverage = 72; // 72% average occupancy
            const weatherFactor = Math.random() > 0.5 ? 'rain' : 'sunny';

            // Simple logic: Rain increases indoor bookings by 15-25%
            const weatherBoost = weatherFactor === 'rain' ? 18 : -5;
            const predicted = Math.min(100, Math.max(0, historicalAverage + weatherBoost));

            let trend: 'low' | 'medium' | 'high';
            if (predicted < 50) trend = 'low';
            else if (predicted < 75) trend = 'medium';
            else trend = 'high';

            setForecast({
                predictedOccupancy: Math.round(predicted),
                trend,
                weatherFactor: weatherFactor === 'rain' ? 'Regen verwacht' : 'Zonnig weer',
                weatherIcon: weatherFactor === 'rain' ? '🌧️' : '☀️',
                confidence: 85,
                historicalAverage
            });
            setLoading(false);
        }, 1000);
    }, []);

    if (loading) {
        return (
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-cyan-900/20 p-8">
                <div className="flex items-center justify-center h-40">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    if (!forecast) return null;

    const trendColors = {
        low: { bg: 'from-gray-900/40 to-gray-800/40', text: 'text-gray-400', border: 'border-gray-500/30', glow: 'shadow-gray-500/20' },
        medium: { bg: 'from-yellow-900/40 to-orange-800/40', text: 'text-yellow-400', border: 'border-yellow-500/30', glow: 'shadow-yellow-500/20' },
        high: { bg: 'from-green-900/40 to-emerald-800/40', text: 'text-green-400', border: 'border-green-500/30', glow: 'shadow-green-500/20' }
    };

    const colors = trendColors[forecast.trend];

    return (
        <div className={`relative overflow-hidden rounded-3xl border ${colors.border} bg-gradient-to-br ${colors.bg} p-8 shadow-2xl ${colors.glow} group`}>
            {/* Animated Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">AI Forecast</h3>
                            <p className="text-xs text-gray-500">Voorspelling voor morgen</p>
                        </div>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
                        <span className="text-xs font-bold text-gray-400">{forecast.confidence}% betrouwbaar</span>
                    </div>
                </div>

                {/* Main Prediction */}
                <div className="mb-6">
                    <div className="flex items-end gap-4 mb-3">
                        <div>
                            <p className="text-6xl font-black text-white mb-1">{forecast.predictedOccupancy}%</p>
                            <p className={`text-sm font-bold uppercase tracking-wider ${colors.text}`}>
                                {forecast.trend === 'low' ? '🔵 Rustig' : forecast.trend === 'medium' ? '🟡 Gemiddeld' : '🟢 Druk'}
                            </p>
                        </div>
                        <div className="flex-1 h-24 relative">
                            {/* Visual Bar Chart */}
                            <div className="absolute bottom-0 left-0 right-0 flex items-end gap-2 h-full">
                                <div className="flex-1 bg-white/10 rounded-t-lg relative overflow-hidden" style={{ height: `${forecast.historicalAverage}%` }}>
                                    <div className="absolute inset-0 bg-gradient-to-t from-blue-500/30 to-blue-500/10"></div>
                                    <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white/60">Gem.</span>
                                </div>
                                <div className={`flex-1 bg-gradient-to-t ${forecast.trend === 'high' ? 'from-green-500 to-emerald-400' : forecast.trend === 'medium' ? 'from-yellow-500 to-orange-400' : 'from-gray-500 to-gray-400'} rounded-t-lg relative shadow-lg`} style={{ height: `${forecast.predictedOccupancy}%` }}>
                                    <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white">Morgen</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Weather Context */}
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                    <span className="text-3xl">{forecast.weatherIcon}</span>
                    <div className="flex-1">
                        <p className="text-sm font-bold text-white mb-0.5">{forecast.weatherFactor}</p>
                        <p className="text-xs text-gray-400">
                            {forecast.weatherFactor.includes('Regen')
                                ? 'Indoor banen zullen vollopen'
                                : 'Outdoor banen populair'}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-500">vs. gemiddelde</p>
                        <p className={`text-lg font-black ${forecast.predictedOccupancy > forecast.historicalAverage ? 'text-green-400' : 'text-red-400'}`}>
                            {forecast.predictedOccupancy > forecast.historicalAverage ? '+' : ''}{forecast.predictedOccupancy - forecast.historicalAverage}%
                        </p>
                    </div>
                </div>

                {/* Action Suggestion */}
                {forecast.trend === 'high' && (
                    <div className="mt-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                        <p className="text-xs font-bold text-green-400 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                            </svg>
                            Tip: Overweeg extra personeel in te roosteren
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
