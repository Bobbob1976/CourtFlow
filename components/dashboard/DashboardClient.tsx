"use client";

import Link from "next/link";
import { useLanguage } from "@/components/providers/LanguageProvider";
import UserStatsWidget from "@/components/stats/UserStatsWidget";
import WeatherWidget from "@/components/weather/WeatherWidget";
import { QuickChallengeButton } from "@/components/social/ChallengeModal";

interface DashboardClientProps {
    user: any;
    stats: any[];
    bookings: any[];
}

export default function DashboardClient({ user, stats, bookings }: DashboardClientProps) {
    const { t, locale } = useLanguage();

    // Filter for upcoming bookings
    const upcomingBookings = bookings
        .filter(b => {
            if (!b.booking_date || !b.end_time) return false;
            if (b.cancelled_at) return false;
            const end = new Date(`${b.booking_date}T${b.end_time}`);
            return end >= new Date();
        })
        .slice(0, 3)
        .sort((a, b) => new Date(`${a.booking_date}T${a.start_time}`).getTime() - new Date(`${b.booking_date}T${b.start_time}`).getTime());

    // Filter for past bookings
    const pastBookings = bookings
        .filter(b => {
            if (!b.booking_date || !b.end_time) return false;
            if (b.cancelled_at) return false;
            const end = new Date(`${b.booking_date}T${b.end_time}`);
            return end < new Date();
        })
        .sort((a, b) => new Date(`${b.booking_date}T${b.start_time}`).getTime() - new Date(`${a.booking_date}T${a.start_time}`).getTime())
        .slice(0, 3);

    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Hero Header */}
                <div className="relative">
                    {/* Gradient Glow */}
                    <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-br from-courtflow-orange/20 to-courtflow-green/20 rounded-full blur-3xl opacity-30 pointer-events-none"></div>

                    <div className="relative glass-card rounded-3xl p-8 md:p-12 border-2 border-white/10">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <p className="text-sm text-gray-400 mb-2">{t.dashboard.welcome}</p>
                                <h1 className="text-4xl md:text-6xl font-black text-white mb-4">
                                    Hey, <span className="text-transparent bg-clip-text bg-gradient-to-r from-courtflow-orange to-courtflow-green">
                                        {user.user_metadata?.full_name?.split(' ')[0] || 'Sporter'}
                                    </span>! 👋
                                </h1>
                                <p className="text-xl text-gray-300">{t.dashboard.ready}</p>
                            </div>

                            {/* User Avatar */}
                            <div className="hidden md:block w-24 h-24 rounded-2xl bg-gradient-to-br from-courtflow-orange to-courtflow-green p-1">
                                <div className="w-full h-full rounded-xl bg-slate-950 flex items-center justify-center text-4xl font-black text-white">
                                    {user.user_metadata?.full_name?.charAt(0) || 'U'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* User Stats - NEW GAMIFICATION */}
                <UserStatsWidget userId={user.id} />

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content - Left 2 columns */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Challenge Button - NEW */}
                        <QuickChallengeButton userId={user.id} clubId="demo-club-id" />

                        {/* Upcoming Bookings */}
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-black text-white">{t.dashboard.upcoming}</h2>
                                    <p className="text-sm text-gray-400">Je aankomende sessies</p>
                                </div>
                                <Link
                                    href="/demo-club"
                                    className="px-4 py-2 rounded-xl bg-courtflow-green hover:bg-courtflow-green/80 text-white font-semibold transition-all duration-300 hover:scale-105"
                                >
                                    Boek Nu ⚡
                                </Link>
                            </div>

                            {upcomingBookings.length > 0 ? (
                                <div className="space-y-4">
                                    {upcomingBookings.map((booking: any) => (
                                        <Link
                                            key={booking.id}
                                            href={`/${booking.club?.subdomain || 'demo-club'}`}
                                            className="block glass-card rounded-2xl p-6 border-2 border-white/10 hover:border-courtflow-green/50 card-hover"
                                        >
                                            <div className="flex items-center gap-4">
                                                {/* Date Badge */}
                                                <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-courtflow-orange to-courtflow-green p-0.5">
                                                    <div className="w-full h-full rounded-lg bg-slate-950 flex flex-col items-center justify-center text-white">
                                                        <span className="text-xs font-medium">
                                                            {new Date(booking.booking_date).toLocaleDateString('nl-NL', { weekday: 'short' })}
                                                        </span>
                                                        <span className="text-xl font-black">
                                                            {new Date(booking.booking_date).getDate()}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Booking Info */}
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-bold text-white mb-1">
                                                        {booking.court?.name || 'Court'}
                                                    </h3>
                                                    <p className="text-sm text-gray-400">
                                                        {booking.start_time} - {booking.end_time} • {booking.club?.name}
                                                    </p>
                                                </div>

                                                {/* Arrow */}
                                                <svg className="w-6 h-6 text-courtflow-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="glass-card rounded-2xl p-12 text-center border-2 border-dashed border-white/10">
                                    <div className="text-6xl mb-4">📅</div>
                                    <h3 className="text-xl font-bold text-white mb-2">Geen bookings</h3>
                                    <p className="text-gray-400 mb-6">Tijd om je volgende sessie te plannen!</p>
                                    <Link
                                        href="/demo-club"
                                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-courtflow-orange to-courtflow-green text-white font-bold hover:scale-105 transition-transform"
                                    >
                                        Boek Nu 🎾
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Recent Matches */}
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-black text-white">{t.dashboard.recent}</h2>
                                    <p className="text-sm text-gray-400">Je laatste gespeelde sessies</p>
                                </div>
                            </div>

                            {pastBookings.length > 0 ? (
                                <div className="space-y-3">
                                    {pastBookings.map((booking: any) => (
                                        <div
                                            key={booking.id}
                                            className="glass-card rounded-xl p-4 border border-white/10"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center text-2xl">
                                                    🎾
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-semibold text-white">{booking.court?.name}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(booking.booking_date).toLocaleDateString('nl-NL')} • {booking.start_time}
                                                    </p>
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    Voltooid ✓
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="glass-card rounded-xl p-8 text-center border border-white/10">
                                    <p className="text-gray-400">Nog geen recente matches</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar - Right 1 column */}
                    <div className="space-y-6">
                        {/* Weather Widget - NEW */}
                        <WeatherWidget cityName="Amsterdam" />

                        {/* Quick Stats */}
                        <div className="glass-card rounded-2xl p-6 border-2 border-white/10">
                            <h3 className="text-lg font-bold text-white mb-4">Snelle Stats 📊</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                                    <span className="text-gray-400">Total Bookings</span>
                                    <span className="font-bold text-white">{bookings.length}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                                    <span className="text-gray-400">Komende</span>
                                    <span className="font-bold text-courtflow-green">{upcomingBookings.length}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                                    <span className="text-gray-400">Afgelopen</span>
                                    <span className="font-bold text-gray-400">{pastBookings.length}</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="glass-card rounded-2xl p-6 border-2 border-white/10">
                            <h3 className="text-lg font-bold text-white mb-4">Snelle Acties ⚡</h3>
                            <div className="space-y-2">
                                <Link
                                    href="/wallet"
                                    className="block p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">💰</span>
                                        <span className="text-white group-hover:text-courtflow-green transition-colors">Wallet</span>
                                    </div>
                                </Link>
                                <Link
                                    href="/help"
                                    className="block p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">❓</span>
                                        <span className="text-white group-hover:text-courtflow-green transition-colors">Hulp</span>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
