'use client';

import { useEffect, useState } from 'react';

// Open-Meteo code mapping (WMO Weather interpretation codes)
const getWeatherIcon = (code: number) => {
    if (code === 0) return '☀️'; // Clear sky
    if (code <= 3) return 'cloud'; // Partly cloudy
    if (code <= 48) return '🌫️'; // Fog
    if (code <= 55) return '🌧️'; // Drizzle
    if (code <= 65) return '☔'; // Rain
    if (code <= 77) return '🌨️'; // Snow grains
    if (code <= 82) return '🌧️'; // Rain showers
    if (code <= 86) return '❄️'; // Snow showers
    if (code <= 99) return '⛈️'; // Thunderstorm
    return '⛅';
};

const getWeatherDescription = (code: number) => {
    if (code === 0) return 'Zonnig';
    if (code <= 3) return 'Bewolkt';
    if (code <= 48) return 'Mistig';
    if (code <= 65) return 'Regenachtig';
    if (code <= 77) return 'Sneeuw';
    if (code <= 99) return 'Onweer';
    return 'Wisselvallig';
};

export default function WeatherWidget() {
    const [weather, setWeather] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch weather for Amsterdam (default) using Open-Meteo (No API Key needed!)
        async function fetchWeather() {
            try {
                const res = await fetch(
                    'https://api.open-meteo.com/v1/forecast?latitude=52.37&longitude=4.89&current_weather=true'
                );
                const data = await res.json();
                setWeather(data.current_weather);
            } catch (e) {
                console.error("Weather fetch failed", e);
            } finally {
                setLoading(false);
            }
        }
        fetchWeather();
    }, []);

    if (loading) return <div className="animate-pulse bg-white/5 w-24 h-10 rounded-full"></div>;
    if (!weather) return null;

    const icon = getWeatherIcon(weather.weathercode);
    const desc = getWeatherDescription(weather.weathercode);

    return (
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-lg select-none hover:bg-black/50 transition-colors cursor-help" title={`Wind: ${weather.windspeed} km/h`}>
            <span className="text-xl leading-none filter drop-shadow-md">{icon}</span>
            <div className="flex flex-col">
                <span className="text-sm font-bold text-white leading-none">
                    {Math.round(weather.temperature)}°C
                </span>
                <span className="text-[10px] text-gray-300 leading-none uppercase tracking-wider font-medium mt-0.5">
                    {desc}
                </span>
            </div>
        </div>
    );
}
