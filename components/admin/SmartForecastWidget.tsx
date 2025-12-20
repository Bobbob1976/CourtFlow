"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Users, AlertTriangle, Sun, Cloud, CloudRain } from "lucide-react";

interface ForecastData {
    predictedOccupancy: number;
    confidence: number;
    recommendation: string;
    weatherCondition: string;
    temperature: number;
    factors: {
        historical: number;
        weather: string;
        dayType: string;
    };
}

export default function SmartForecastWidget({ clubId }: { clubId: string }) {
    const [forecast, setForecast] = useState<ForecastData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchForecast();
    }, [clubId]);

    async function fetchForecast() {
        try {
            const response = await fetch(`/api/admin/forecast?clubId=${clubId}`);
            const data = await response.json();
            setForecast(data);
        } catch (error) {
            console.error("Failed to fetch forecast:", error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-2xl p-6 animate-pulse">
                <div className="h-24 bg-white/10 rounded-xl"></div>
            </div>
        );
    }

    if (!forecast) {
        return null;
    }

    const getOccupancyColor = (occupancy: number) => {
        if (occupancy >= 80) return "text-red-400 bg-red-500/20 border-red-500/30";
        if (occupancy >= 50) return "text-yellow-400 bg-yellow-500/20 border-yellow-500/30";
        return "text-green-400 bg-green-500/20 border-green-500/30";
    };

    const getOccupancyLabel = (occupancy: number) => {
        if (occupancy >= 80) return "Zeer Druk";
        if (occupancy >= 50) return "Gemiddeld";
        return "Rustig";
    };

    const WeatherIcon = () => {
        switch (forecast.weatherCondition) {
            case "sunny":
                return <Sun className="w-8 h-8 text-yellow-400" />;
            case "rainy":
                return <CloudRain className="w-8 h-8 text-blue-400" />;
            default:
                return <Cloud className="w-8 h-8 text-gray-400" />;
        }
    };

    return (
        <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-2xl p-6 relative overflow-hidden group hover:shadow-2xl hover:shadow-purple-900/30 transition-all duration-300">
            {/* Animated background blob */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-purple-500/30 transition-all"></div>

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/20 rounded-xl">
                            <TrendingUp className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Smart Forecast</h3>
                            <p className="text-xs text-gray-400">Morgen • {new Date(Date.now() + 86400000).toLocaleDateString('nl-NL', { weekday: 'long' })}</p>
                        </div>
                    </div>
                    <WeatherIcon />
                </div>

                {/* Main Prediction */}
                <div className="mb-4">
                    <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-4xl font-bold text-white">
                            {Math.round(forecast.predictedOccupancy)}%
                        </span>
                        <span className="text-gray-400 text-sm">verwachte bezetting</span>
                    </div>

                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold border ${getOccupancyColor(forecast.predictedOccupancy)}`}>
                        {getOccupancyLabel(forecast.predictedOccupancy)}
                        <span className="text-xs opacity-75">({forecast.confidence}% zekerheid)</span>
                    </div>
                </div>

                {/* Weather Info */}
                <div className="bg-white/5 rounded-xl p-3 mb-4 border border-white/10">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Temperatuur</span>
                        <span className="text-white font-bold">{forecast.temperature}°C</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                        <span className="text-gray-400">Historisch gemiddelde</span>
                        <span className="text-white font-bold">{forecast.factors.historical}%</span>
                    </div>
                </div>

                {/* Recommendation */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        {forecast.predictedOccupancy >= 80 ? (
                            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                        ) : (
                            <Users className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                        )}
                        <div>
                            <p className="text-sm font-bold text-white mb-1">Advies</p>
                            <p className="text-xs text-gray-300">{forecast.recommendation}</p>
                        </div>
                    </div>
                </div>

                {/* Confidence Indicator */}
                <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Voorspelling betrouwbaarheid</span>
                        <span>{forecast.confidence}%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500"
                            style={{ width: `${forecast.confidence}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
