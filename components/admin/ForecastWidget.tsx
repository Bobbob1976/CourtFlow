"use client";

import { useEffect, useState } from "react";
import { BarChart, Calendar, TrendingUp } from "lucide-react";

interface ForecastDay {
    day: string;
    date: string;
    count: number;
    status: string;
    color: string;
}

export default function ForecastWidget() {
    const [days, setDays] = useState<ForecastDay[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchForecast = async () => {
            try {
                const res = await fetch('/api/admin/forecast');
                const data = await res.json();
                setDays(data.days || []);
            } catch (error) {
                console.error("Failed forecast fetch", error);
            } finally {
                setLoading(false);
            }
        };

        fetchForecast();
    }, []);

    if (loading) {
        return (
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#1a1a1a] p-8 h-80 flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (days.length === 0) return null;

    // Calculate max for bar height
    const maxCount = Math.max(...days.map(d => d.count), 5); // min scale 5
    const today = days[0];

    return (
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-gray-900 to-gray-800 p-8 shadow-2xl group">

            {/* Header */}
            <div className="flex items-center justify-between mb-8 z-10 relative">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C4FF0D] to-green-600 flex items-center justify-center shadow-lg shadow-green-500/20">
                        <TrendingUp className="w-6 h-6 text-[#0A1628]" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Weekoverzicht</h3>
                        <p className="text-xs text-gray-500">Verwachte drukte 7 dagen</p>
                    </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-xs font-bold text-gray-400">Live Data</span>
                </div>
            </div>

            {/* Main Stats (Vandaag) */}
            <div className="mb-8 z-10 relative">
                <div className="flex items-baseline gap-2">
                    <p className="text-5xl font-black text-white">{today.count}</p>
                    <p className="text-lg text-gray-400">boekingen</p>
                </div>
                <p className={`text-sm font-bold uppercase tracking-wider mt-1 ${today.count > 10 ? 'text-[#C4FF0D]' : 'text-blue-400'}`}>
                    Vandaag: {today.status}
                </p>
            </div>

            {/* 7 Day Bar Chart */}
            <div className="h-32 flex items-end justify-between gap-2 z-10 relative">
                {days.map((day, i) => {
                    const heightPercent = (day.count / maxCount) * 100;
                    const isToday = i === 0;

                    return (
                        <div key={i} className="flex-1 flex flex-col justify-end group/bar relative h-full">
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none border border-white/20 z-20 font-bold shadow-xl">
                                {day.count} boekingen
                            </div>

                            {/* Bar */}
                            <div
                                className={`w-full rounded-t-lg transition-all duration-700 relative 
                                    ${isToday ? 'bg-[#C4FF0D]' : 'bg-white/10 group-hover/bar:bg-white/20'}
                                `}
                                style={{ height: `${Math.max(heightPercent, 5)}%` }}
                            >
                            </div>

                            {/* Label */}
                            <div className={`mt-2 text-[10px] text-center truncate font-mono uppercase ${isToday ? 'text-white font-bold' : 'text-gray-500'}`}>
                                {day.day.substring(0, 3)}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#C4FF0D]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        </div>
    );
}
