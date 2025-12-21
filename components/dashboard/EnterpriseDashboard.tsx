'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

interface DashboardStats {
    totalBookings: number;
    upcomingBookings: number;
    completedThisMonth: number;
    revenue: number;
    activeStreak: number;
    winRate: number;
}

export default function EnterpriseDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        totalBookings: 0,
        upcomingBookings: 0,
        completedThisMonth: 0,
        revenue: 0,
        activeStreak: 0,
        winRate: 0,
    });
    const [userName, setUserName] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                // Get user profile
                const { data: profile } = await supabase
                    .from('user_profiles')
                    .select('full_name')
                    .eq('id', user.id)
                    .single();

                setUserName(profile?.full_name || user.email?.split('@')[0] || 'User');

                // Get bookings stats
                const { data: bookings } = await supabase
                    .from('bookings')
                    .select('*')
                    .eq('user_id', user.id);

                const now = new Date();
                const thisMonth = now.getMonth();
                const thisYear = now.getFullYear();

                const upcoming = bookings?.filter(b =>
                    new Date(b.booking_date) >= now && !b.cancelled_at
                ).length || 0;

                const completedThisMonth = bookings?.filter(b => {
                    const bookingDate = new Date(b.booking_date);
                    return bookingDate < now &&
                        bookingDate.getMonth() === thisMonth &&
                        bookingDate.getFullYear() === thisYear &&
                        !b.cancelled_at;
                }).length || 0;

                const totalRevenue = bookings?.reduce((sum, b) =>
                    sum + (b.total_price || 0), 0
                ) || 0;

                // Get user stats
                const { data: userStats } = await supabase
                    .from('user_stats')
                    .select('*')
                    .eq('user_id', user.id)
                    .single();

                setStats({
                    totalBookings: bookings?.length || 0,
                    upcomingBookings: upcoming,
                    completedThisMonth,
                    revenue: totalRevenue,
                    activeStreak: userStats?.current_streak || 0,
                    winRate: userStats?.total_matches ?
                        Math.round((userStats.total_wins / userStats.total_matches) * 100) : 0,
                });
            }

            setLoading(false);
        }

        loadData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-deep-navy flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-electric-lime/30 border-t-electric-lime rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-deep-navy">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-heavy text-soft-white mb-2">
                        Dashboard
                    </h1>
                    <p className="text-lg text-muted-gray font-medium">
                        {userName}
                    </p>
                </div>

                {/* Primary Action */}
                <div className="mb-8">
                    <Link
                        href="/demo-club"
                        className="inline-flex items-center gap-3 px-8 py-4 bg-electric-lime text-deep-navy 
                       rounded-2xl font-heavy text-lg hover:bg-lime-glow transition-all duration-300
                       shadow-lg hover:shadow-xl hover:scale-[1.02]"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                        Nieuwe Reservering
                    </Link>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

                    {/* Metric Card 1 */}
                    <div className="premium-card p-6">
                        <div className="text-muted-gray text-sm font-semibold uppercase tracking-wider mb-2">
                            Deze Maand
                        </div>
                        <div className="text-5xl font-heavy text-soft-white mb-1">
                            {stats.completedThisMonth}
                        </div>
                        <div className="text-sm text-muted-gray font-medium">
                            Gespeelde Sessies
                        </div>
                        <div className="mt-4 h-1 w-full bg-midnight rounded-full overflow-hidden">
                            <div
                                className="h-full bg-success-green rounded-full transition-all duration-500"
                                style={{ width: `${Math.min((stats.completedThisMonth / 20) * 100, 100)}%` }}
                            />
                        </div>
                    </div>

                    {/* Metric Card 2 */}
                    <div className="premium-card p-6">
                        <div className="text-muted-gray text-sm font-semibold uppercase tracking-wider mb-2">
                            Aankomend
                        </div>
                        <div className="text-5xl font-heavy text-soft-white mb-1">
                            {stats.upcomingBookings}
                        </div>
                        <div className="text-sm text-muted-gray font-medium">
                            Geplande Sessies
                        </div>
                        <div className="mt-4">
                            <Link
                                href="/bookings"
                                className="text-sm text-electric-lime font-semibold hover:text-lime-glow transition-colors"
                            >
                                Bekijk agenda →
                            </Link>
                        </div>
                    </div>

                    {/* Metric Card 3 */}
                    <div className="premium-card p-6">
                        <div className="text-muted-gray text-sm font-semibold uppercase tracking-wider mb-2">
                            Streak
                        </div>
                        <div className="text-5xl font-heavy text-soft-white mb-1">
                            {stats.activeStreak}
                        </div>
                        <div className="text-sm text-muted-gray font-medium">
                            Dagen Actief
                        </div>
                        <div className="mt-4 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-success-green animate-pulse" />
                            <span className="text-xs text-success-green font-semibold">ACTIEF</span>
                        </div>
                    </div>

                    {/* Metric Card 4 */}
                    <div className="premium-card p-6">
                        <div className="text-muted-gray text-sm font-semibold uppercase tracking-wider mb-2">
                            Win Rate
                        </div>
                        <div className="text-5xl font-heavy text-soft-white mb-1">
                            {stats.winRate}%
                        </div>
                        <div className="text-sm text-muted-gray font-medium">
                            Gewonnen Wedstrijden
                        </div>
                        <div className="mt-4 h-1 w-full bg-midnight rounded-full overflow-hidden">
                            <div
                                className="h-full bg-warning-orange rounded-full transition-all duration-500"
                                style={{ width: `${stats.winRate}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Action Card 1 */}
                    <Link
                        href="/bookings"
                        className="premium-card p-6 hover:border-electric-lime/30 group cursor-pointer"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-midnight flex items-center justify-center">
                                <svg className="w-6 h-6 text-electric-lime" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="text-muted-gray group-hover:text-electric-lime transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                        <h3 className="text-xl font-heavy text-soft-white mb-2">
                            Mijn Reserveringen
                        </h3>
                        <p className="text-sm text-muted-gray font-medium">
                            Beheer je geplande en voltooide sessies
                        </p>
                    </Link>

                    {/* Action Card 2 */}
                    <Link
                        href="/wallet"
                        className="premium-card p-6 hover:border-success-green/30 group cursor-pointer"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-midnight flex items-center justify-center">
                                <svg className="w-6 h-6 text-success-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                            </div>
                            <div className="text-muted-gray group-hover:text-success-green transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                        <h3 className="text-xl font-heavy text-soft-white mb-2">
                            Wallet
                        </h3>
                        <p className="text-sm text-muted-gray font-medium">
                            Tegoed: €{stats.revenue.toFixed(2)}
                        </p>
                    </Link>

                    {/* Action Card 3 */}
                    <Link
                        href="/help"
                        className="premium-card p-6 hover:border-warning-orange/30 group cursor-pointer"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-midnight flex items-center justify-center">
                                <svg className="w-6 h-6 text-warning-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="text-muted-gray group-hover:text-warning-orange transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                        <h3 className="text-xl font-heavy text-soft-white mb-2">
                            Help Center
                        </h3>
                        <p className="text-sm text-muted-gray font-medium">
                            Veelgestelde vragen en ondersteuning
                        </p>
                    </Link>
                </div>

                {/* Bottom CTA */}
                <div className="mt-8 premium-card p-8 text-center">
                    <h3 className="text-2xl font-heavy text-soft-white mb-3">
                        Klaar om te spelen?
                    </h3>
                    <p className="text-muted-gray mb-6 max-w-2xl mx-auto">
                        Vind beschikbare banen, boek direct en beheer je sessies allemaal op één plek.
                    </p>
                    <Link
                        href="/demo-club"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-midnight text-soft-white 
                       rounded-xl font-semibold hover:bg-dark-navy transition-all duration-300
                       border border-white/10 hover:border-electric-lime/50"
                    >
                        Zoek Beschikbare Banen
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </Link>
                </div>

            </div>
        </div>
    );
}
