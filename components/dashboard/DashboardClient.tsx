"use client";

import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
} from "recharts";
import Link from "next/link";
import { LockOpenIcon } from "@heroicons/react/24/solid";

import { format, isToday, isTomorrow } from "date-fns";
// import { nl } from "date-fns/locale"; 

import BookingCard from "@/components/booking/BookingCard";
import VisualBookingCard from "./VisualBookingCard";
import ClubVibeHeader from "./ClubVibeHeader";
import MatchHistoryItem from "../matches/MatchHistoryItem";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface DashboardClientProps {
    user: any;
    stats: any[];
    bookings: any[];
}

export default function DashboardClient({ user, stats, bookings }: DashboardClientProps) {
    const { t, locale } = useLanguage();

    // Filter for upcoming bookings (exclude cancelled)
    const upcomingBookings = bookings
        .filter(b => {
            if (!b.booking_date || !b.end_time) return false;
            if (b.cancelled_at) return false; // Exclude cancelled bookings
            const end = new Date(`${b.booking_date}T${b.end_time}`);
            return end >= new Date();
        })
        .slice(0, 3)
        .sort((a, b) => new Date(`${a.booking_date}T${a.start_time}`).getTime() - new Date(`${b.booking_date}T${b.start_time}`).getTime());

    // Filter for past bookings (Recent Matches) (exclude cancelled)
    const pastBookings = bookings
        .filter(b => {
            if (!b.booking_date || !b.end_time) return false;
            if (b.cancelled_at) return false; // Exclude cancelled bookings
            const end = new Date(`${b.booking_date}T${b.end_time}`);
            return end < new Date();
        })
        .sort((a, b) => new Date(`${b.booking_date}T${b.start_time}`).getTime() - new Date(`${a.booking_date}T${a.start_time}`).getTime())
        .slice(0, 3);

    return (
        <div className="max-w-md mx-auto p-6 space-y-8 font-sans pt-8">
            {/* Header Section */}
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">
                        {t.dashboard.welcome}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">{user.user_metadata?.full_name?.split(' ')[0] || 'Sporter'}</span> 👋
                    </h1>
                    <p className="text-gray-400 text-sm">{t.dashboard.ready}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-0.5">
                    <div className="w-full h-full rounded-full bg-[#121212] flex items-center justify-center text-sm font-bold text-white">
                        {user.user_metadata?.full_name?.charAt(0) || 'U'}
                    </div>
                </div>
            </header>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl glass-card relative overflow-hidden group hover:bg-white/10 transition-all duration-300">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 text-blue-400">
                            <path fillRule="evenodd" d="M2.25 13.5a8.25 8.25 0 0 1 8.25-8.25.75.75 0 0 1 .75.75v6.75H18a.75.75 0 0 1 .75.75 8.25 8.25 0 0 1-16.5 0Z" clipRule="evenodd" />
                            <path fillRule="evenodd" d="M12.75 3a.75.75 0 0 1 .75-.75 8.25 8.25 0 0 1 8.25 8.25.75.75 0 0 1-.75.75h-7.5a.75.75 0 0 1-.75-.75V3Z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">{t.dashboard.matches}</p>
                    <h3 className="text-3xl font-bold text-white">12</h3>
                    <p className="text-green-400 text-xs font-bold mt-2 flex items-center gap-1">
                        <span>↑ 2</span>
                        <span className="text-gray-500 font-normal">{t.dashboard.thisWeek}</span>
                    </p>
                </div>
                <div className="p-4 rounded-2xl glass-card relative overflow-hidden group hover:bg-white/10 transition-all duration-300">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 text-purple-400">
                            <path fillRule="evenodd" d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 0 0-.584.859 6.753 6.753 0 0 0 6.138 5.6 6.73 6.73 0 0 0 2.743 1.346A6.707 6.707 0 0 1 9.279 15H8.54c-1.036 0-1.875.84-1.875 1.875V19.5h-.75a2.25 2.25 0 0 0-2.25 2.25c0 .414.336.75.75.75h15a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-2.25-2.25h-.75v-2.625c0-1.036-.84-1.875-1.875-1.875h-.739a6.706 6.706 0 0 1-1.112-3.173 6.73 6.73 0 0 0 2.743-1.347 6.753 6.753 0 0 0 6.139-5.6.75.75 0 0 0-.585-.858 47.077 47.077 0 0 0-3.07-.543V2.62a.75.75 0 0 0-.658-.744 49.22 49.22 0 0 0-6.093-.377c-2.063 0-4.096.128-6.093.377a.75.75 0 0 0-.657.744Zm0 2.629c0 1.196.312 2.32.857 3.294A5.266 5.266 0 0 1 3.16 5.337a45.6 45.6 0 0 1 2.006-.343v.256Zm13.5 0v-.256c.674.1 1.343.214 2.006.343a5.265 5.265 0 0 1-2.863 3.207 6.72 6.72 0 0 0 .857-3.294Z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">{t.dashboard.rating}</p>
                    <h3 className="text-3xl font-bold text-white">4.2</h3>
                    <p className="text-purple-400 text-xs font-bold mt-2 flex items-center gap-1">
                        <span>{t.dashboard.level} 4</span>
                    </p>
                </div>
            </div>

            {/* Club Vibe Header */}
            <ClubVibeHeader
                clubName="PadelDam Amsterdam"
                clubId="demo"
                availableCourts={4}
                totalCourts={8}
            />

            {/* Booking Timeline Preview */}
            <section className="pt-4">
                <div className="flex justify-between items-end mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-3">
                        <span className="w-1.5 h-8 bg-cyan-400 rounded-full shadow-[0_0_15px_#22d3ee]"></span>
                        {t.dashboard.upcoming}
                    </h3>
                    <Link href="/bookings" className="text-xs font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-wider">{t.dashboard.viewAll} &rarr;</Link>
                </div>

                <div className="space-y-6">
                    {upcomingBookings.length > 0 ? upcomingBookings.map((booking) => (
                        <VisualBookingCard key={booking.id} booking={booking} />
                    )) : (
                        <div className="p-8 text-center border border-dashed border-white/10 rounded-3xl bg-white/5">
                            <p className="text-gray-400 font-medium">{locale === 'nl' ? 'Geen aankomende sessies' : 'No upcoming sessions'}</p>
                            <Link href="/demo" className="inline-block mt-4 text-sm font-bold text-blue-400 hover:text-blue-300">{t.dashboard.directBook} &rarr;</Link>
                        </div>
                    )}
                </div>
            </section>

            {/* Recent Matches (Game Engine) */}
            <section className="pt-4 pb-12">
                <div className="flex justify-between items-end mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-3">
                        <span className="w-1.5 h-8 bg-purple-400 rounded-full shadow-[0_0_15px_#a855f7]"></span>
                        {t.dashboard.matches}
                    </h3>
                </div>

                <div className="space-y-4">
                    {pastBookings.length > 0 ? (
                        pastBookings.map((booking, index) => {
                            // Mock player data - in real app, fetch from matches table
                            const mockPlayers = [
                                { id: user.id, name: user.user_metadata?.full_name || (locale === 'nl' ? 'Jij' : 'You') },
                                { id: '2', name: 'Jan de Vries' },
                                { id: '3', name: 'Emma Bakker' },
                                { id: '4', name: 'Lisa Jansen' }
                            ];

                            // Mock scores and results
                            const mockScores = ['6-4 6-2', '7-5 6-3', '6-7 6-4 10-8', '6-2 6-1'];
                            const mockResults: ('won' | 'lost' | 'draw')[] = ['won', 'lost', 'won', 'draw'];

                            return (
                                <MatchHistoryItem
                                    key={booking.id}
                                    match={{
                                        id: booking.id,
                                        date: `${booking.booking_date}T${booking.start_time}`,
                                        court_name: booking.court.name,
                                        club_name: booking.club.name,
                                        score: mockScores[index % mockScores.length],
                                        result: mockResults[index % mockResults.length],
                                        players: mockPlayers
                                    }}
                                />
                            );
                        })
                    ) : (
                        <div className="p-8 text-center border border-dashed border-white/10 rounded-3xl bg-white/5">
                            <p className="text-gray-400 font-medium">{locale === 'nl' ? 'Nog geen gespeelde matches' : 'No matches played yet'}</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
