"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

interface UserStats {
    current_streak: number;
    longest_streak: number;
    total_bookings: number;
    total_matches: number;
    total_wins: number;
    total_losses: number;
    badges: any[];
    points: number;
    level: number;
}

export default function UserStatsWidget({ userId }: { userId: string }) {
    const [stats, setStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function loadStats() {
            const { data, error } = await supabase
                .from("user_stats")
                .select("*")
                .eq("user_id", userId)
                .single();

            if (!error && data) {
                setStats(data);
            } else {
                // Create stats if they don't exist
                const { data: newStats } = await supabase
                    .from("user_stats")
                    .insert([{ user_id: userId }])
                    .select()
                    .single();

                if (newStats) setStats(newStats);
            }
            setLoading(false);
        }

        if (userId) loadStats();
    }, [userId]);

    if (loading) {
        return (
            <div className="glass-card rounded-2xl p-6 animate-pulse">
                <div className="h-8 bg-white/10 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-white/10 rounded w-3/4"></div>
            </div>
        );
    }

    if (!stats) return null;

    const winRate = stats.total_matches > 0
        ? ((stats.total_wins / stats.total_matches) * 100).toFixed(1)
        : 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Streak Card */}
            <div className="glass-card rounded-2xl p-6 card-hover border-2 border-white/10 hover:border-courtflow-orange/50">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-400 text-sm font-medium">STREAK</span>
                    <span className="text-2xl">🔥</span>
                </div>
                <div className="flex items-end gap-2">
                    <span className="text-4xl font-black text-white">{stats.current_streak}</span>
                    <span className="text-gray-400 text-sm pb-1">dagen</span>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                    Longest: {stats.longest_streak} dagen 🏆
                </div>

                {/* Streak Progress Bar */}
                <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-courtflow-orange to-courtflow-green rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((stats.current_streak / 30) * 100, 100)}%` }}
                    ></div>
                </div>
                <div className="mt-1 text-xs text-gray-500 text-right">
                    {30 - stats.current_streak > 0 ? `${30 - stats.current_streak} tot Streak Master` : "Streak Master! 👑"}
                </div>
            </div>

            {/* Win Rate Card */}
            <div className="glass-card rounded-2xl p-6 card-hover border-2 border-white/10 hover:border-courtflow-green/50">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-400 text-sm font-medium">WIN RATE</span>
                    <span className="text-2xl">🏆</span>
                </div>
                <div className="flex items-end gap-2">
                    <span className="text-4xl font-black text-white">{winRate}</span>
                    <span className="text-gray-400 text-sm pb-1">%</span>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                    {stats.total_wins}W - {stats.total_losses}L
                </div>

                {/* Win Rate Circle */}
                <div className="mt-4 flex justify-center">
                    <div className="relative w-16 h-16">
                        <svg className="transform -rotate-90 w-16 h-16">
                            <circle
                                cx="32"
                                cy="32"
                                r="28"
                                stroke="rgba(255,255,255,0.1)"
                                strokeWidth="6"
                                fill="none"
                            />
                            <circle
                                cx="32"
                                cy="32"
                                r="28"
                                stroke="url(#gradient)"
                                strokeWidth="6"
                                fill="none"
                                strokeDasharray={`${(Number(winRate) / 100) * 175.93} 175.93`}
                                className="transition-all duration-500"
                            />
                            <defs>
                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#00d084" />
                                    <stop offset="100%" stopColor="#ff6b35" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                </div>
            </div>

            {/* Level Card */}
            <div className="glass-card rounded-2xl p-6 card-hover border-2 border-white/10 hover:border-courtflow-green/50">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-400 text-sm font-medium">LEVEL</span>
                    <span className="text-2xl">⭐</span>
                </div>
                <div className="flex items-end gap-2">
                    <span className="text-4xl font-black text-white">{stats.level}</span>
                    <span className="text-gray-400 text-sm pb-1">lvl</span>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                    {stats.points} XP punten
                </div>

                {/* XP Progress Bar */}
                <div className="mt-4">
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-courtflow-green to-courtflow-orange rounded-full transition-all duration-500"
                            style={{ width: `${(stats.points % 1000) / 10}%` }}
                        ></div>
                    </div>
                    <div className="mt-1 text-xs text-gray-500 text-right">
                        {1000 - (stats.points % 1000)} XP tot level {stats.level + 1}
                    </div>
                </div>
            </div>

            {/* Badges Card */}
            <div className="glass-card rounded-2xl p-6 card-hover border-2 border-white/10 hover:border-courtflow-orange/50">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-400 text-sm font-medium">BADGES</span>
                    <span className="text-2xl">🎖️</span>
                </div>
                <div className="flex items-end gap-2">
                    <span className="text-4xl font-black text-white">{stats.badges.length}</span>
                    <span className="text-gray-400 text-sm pb-1">/{20}</span>
                </div>

                {/* Badge Grid */}
                <div className="mt-4 grid grid-cols-4 gap-2">
                    {[...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            className={`aspect-square rounded-lg flex items-center justify-center text-xl ${i < stats.badges.length
                                    ? "bg-gradient-to-br from-courtflow-orange to-courtflow-green"
                                    : "bg-white/5"
                                }`}
                        >
                            {i < stats.badges.length ? "🏆" : "🔒"}
                        </div>
                    ))}
                </div>
                <div className="mt-2 text-xs text-gray-500 text-center">
                    {20 - stats.badges.length} more to unlock
                </div>
            </div>
        </div>
    );
}
