"use client";

import { useMemo, useState } from "react";
import { format, subDays, startOfMonth, startOfYear, isSameDay, isSameMonth, subMonths } from "date-fns";
import { nl } from "date-fns/locale";

interface RevenueChartProps {
    bookings: any[];
}

export default function RevenueChart({ bookings }: RevenueChartProps) {
    const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('month');

    // Process data based on timeframe
    const chartData = useMemo(() => {
        const data = [];
        const now = new Date();

        let startDate = subDays(now, 7);
        let dateFormat = "EEE";
        let points = 7;

        if (timeframe === 'month') {
            startDate = subDays(now, 30);
            dateFormat = "d MMM";
            points = 30;
        } else if (timeframe === 'year') {
            points = 12;
            // logic is slightly different for year (group by month)
        }

        if (timeframe === 'year') {
            // Group by Month (Last 12 months)
            for (let i = 11; i >= 0; i--) {
                const monthDate = subMonths(now, i);
                const monthRevenue = bookings
                    .filter(b => isSameMonth(new Date(b.created_at || b.booking_date), monthDate))
                    .reduce((sum, b) => sum + (Number(b.total_cost) || 0), 0);

                data.push({
                    label: format(monthDate, 'MMM', { locale: nl }),
                    value: monthRevenue,
                    date: monthDate
                });
            }
        } else {
            // Group by Day (Last 7 or 30 days)
            for (let i = points - 1; i >= 0; i--) {
                const dayDate = subDays(now, i);
                const dayRevenue = bookings
                    .filter(b => isSameDay(new Date(b.created_at || b.booking_date), dayDate))
                    .reduce((sum, b) => sum + (Number(b.total_cost) || 0), 0);

                data.push({
                    label: format(dayDate, dateFormat, { locale: nl }),
                    value: dayRevenue,
                    date: dayDate
                });
            }
        }

        return data;
    }, [bookings, timeframe]);

    // Calculate Max for scaling
    const maxValue = Math.max(...chartData.map(d => d.value), 10); // avoid div by zero

    return (
        <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h3 className="text-xl font-bold text-white">Omzet Ontwikkeling</h3>
                    <p className="text-sm text-gray-500">Inkomsten uit boekingen</p>
                </div>

                {/* Timeframe Switcher */}
                <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
                    <button
                        onClick={() => setTimeframe('week')}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${timeframe === 'week' ? 'bg-[#C4FF0D] text-[#0A1628]' : 'text-gray-400 hover:text-white'}`}
                    >
                        7 Dagen
                    </button>
                    <button
                        onClick={() => setTimeframe('month')}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${timeframe === 'month' ? 'bg-[#C4FF0D] text-[#0A1628]' : 'text-gray-400 hover:text-white'}`}
                    >
                        30 Dagen
                    </button>
                    <button
                        onClick={() => setTimeframe('year')}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${timeframe === 'year' ? 'bg-[#C4FF0D] text-[#0A1628]' : 'text-gray-400 hover:text-white'}`}
                    >
                        Jaar
                    </button>
                </div>
            </div>

            {/* The Chart */}
            <div className="h-64 flex items-end justify-between gap-2 relative">
                {/* Grid lines (optional visual aid) */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
                    <div className="border-t border-white w-full"></div>
                    <div className="border-t border-white w-full"></div>
                    <div className="border-t border-white w-full"></div>
                    <div className="border-t border-white w-full"></div>
                </div>

                {chartData.map((point, index) => {
                    const heightPercent = (point.value / maxValue) * 100;
                    return (
                        <div key={index} className="flex-1 flex flex-col justify-end group relative h-full">
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/20 z-10">
                                <div className="font-bold">€{point.value.toFixed(2)}</div>
                                <div className="text-[10px] text-gray-400">{format(point.date, 'd MMMM yyyy', { locale: nl })}</div>
                            </div>

                            {/* Bar */}
                            <div
                                className={`w-full rounded-t-sm transition-all duration-500 relative ${point.value > 0 ? 'bg-gradient-to-t from-blue-600 to-blue-400 group-hover:from-[#C4FF0D] group-hover:to-green-400' : 'bg-white/5 h-1'}`}
                                style={{ height: `${point.value > 0 ? heightPercent : 1}%` }}
                            >
                            </div>

                            {/* Label */}
                            <div className="mt-2 text-[10px] text-center text-gray-500 truncate font-mono">
                                {point.label}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
