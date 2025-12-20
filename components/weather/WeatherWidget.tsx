"use client";

import { useEffect, useState } from "react";

interface WeatherData {
    temp: number;
    description: string;
    icon: string;
    feels_like: number;
    humidity: number;
    wind_speed: number;
    rain_probability: number;
}

export default function WeatherWidget({ cityName = "Amsterdam" }: { cityName?: string }) {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchWeather() {
            try {
                // TODO: Add your OpenWeatherMap API key to env variables
                const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY || "demo";
                const response = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`
                );

                if (response.ok) {
                    const data = await response.json();
                    setWeather({
                        temp: Math.round(data.main.temp),
                        description: data.weather[0].description,
                        icon: data.weather[0].icon,
                        feels_like: Math.round(data.main.feels_like),
                        humidity: data.main.humidity,
                        wind_speed: Math.round(data.wind.speed * 3.6), // m/s to km/h
                        rain_probability: data.clouds?.all || 0,
                    });
                }
            } catch (error) {
                console.error("Weather fetch failed:", error);
                // Use mock data for demo
                setWeather({
                    temp: 18,
                    description: "partly cloudy",
                    icon: "02d",
                    feels_like: 17,
                    humidity: 65,
                    wind_speed: 12,
                    rain_probability: 20,
                });
            }
            setLoading(false);
        }

        fetchWeather();
    }, [cityName]);

    if (loading) {
        return (
            <div className="glass-card rounded-2xl p-6 animate-pulse">
                <div className="h-6 bg-white/10 rounded w-1/3 mb-4"></div>
                <div className="h-12 bg-white/10 rounded w-1/2"></div>
            </div>
        );
    }

    if (!weather) return null;

    const getWeatherEmoji = () => {
        if (weather.icon.includes("01")) return "☀️";
        if (weather.icon.includes("02")) return "⛅";
        if (weather.icon.includes("03") || weather.icon.includes("04")) return "☁️";
        if (weather.icon.includes("09") || weather.icon.includes("10")) return "🌧️";
        if (weather.icon.includes("11")) return "⛈️";
        if (weather.icon.includes("13")) return "❄️";
        return "🌤️";
    };

    const getPlayability = () => {
        if (weather.temp < 5) return { text: "Erg koud", color: "text-blue-400", emoji: "🥶" };
        if (weather.temp < 10) return { text: "Koud", color: "text-blue-300", emoji: "😬" };
        if (weather.rain_probability > 70) return { text: "Regenachtig", color: "text-blue-400", emoji: "☔" };
        if (weather.wind_speed > 30) return { text: "Te winderig", color: "text-orange-400", emoji: "💨" };
        if (weather.temp > 30) return { text: "Heet!", color: "text-orange-400", emoji: "🔥" };
        if (weather.temp > 15 && weather.rain_probability < 30) return { text: "Perfect!", color: "text-courtflow-green", emoji: "✅" };
        return { text: "Goed", color: "text-green-400", emoji: "👍" };
    };

    const playability = getPlayability();

    return (
        <div className="glass-card rounded-2xl p-6 border-2 border-white/10 hover:border-courtflow-green/30 transition-all duration-300">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-sm font-medium text-gray-400">WEER VOORSPELLING</h3>
                    <p className="text-xs text-gray-500">{cityName}</p>
                </div>
                <span className="text-4xl">{getWeatherEmoji()}</span>
            </div>

            {/* Temperature */}
            <div className="flex items-center gap-4 mb-4">
                <div className="text-6xl font-black text-white">
                    {weather.temp}°
                </div>
                <div className="flex-1">
                    <p className="text-gray-300 capitalize mb-1">{weather.description}</p>
                    <p className="text-xs text-gray-500">Voelt als {weather.feels_like}°</p>
                </div>
            </div>

            {/* Playability Score */}
            <div className={`mb-4 p-3 rounded-xl bg-white/5 border-2 ${playability.color === "text-courtflow-green" ? "border-courtflow-green/30" : "border-white/10"
                }`}>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Speelbaar:</span>
                    <div className="flex items-center gap-2">
                        <span className={`font-bold ${playability.color}`}>{playability.text}</span>
                        <span className="text-xl">{playability.emoji}</span>
                    </div>
                </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 rounded-lg bg-white/5">
                    <div className="text-2xl mb-1">💧</div>
                    <div className="text-xs text-gray-400">Vochtigheid</div>
                    <div className="text-sm font-bold text-white">{weather.humidity}%</div>
                </div>

                <div className="text-center p-3 rounded-lg bg-white/5">
                    <div className="text-2xl mb-1">💨</div>
                    <div className="text-xs text-gray-400">Wind</div>
                    <div className="text-sm font-bold text-white">{weather.wind_speed} km/u</div>
                </div>

                <div className="text-center p-3 rounded-lg bg-white/5">
                    <div className="text-2xl mb-1">☔</div>
                    <div className="text-xs text-gray-400">Regen</div>
                    <div className="text-sm font-bold text-white">{weather.rain_probability}%</div>
                </div>
            </div>

            {/* Best Time Suggestion */}
            {playability.color === "text-courtflow-green" && (
                <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-courtflow-green/10 to-courtflow-orange/10 border border-courtflow-green/20">
                    <div className="flex items-center gap-2">
                        <span className="text-lg">⚡</span>
                        <span className="text-sm text-gray-300">
                            <span className="font-semibold text-courtflow-green">Prime tijd!</span> Perfect om te spelen tussen 14:00-18:00
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
