'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { getIncomingInvites, respondToInvite } from '@/app/actions/participant-actions';
import Link from 'next/link';
import ScoreSubmissionModal from '@/components/match/ScoreSubmissionModal';

// Mock weather data (replace with real widget connection later)
const WeatherBadge = () => (
    <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
        <span className="text-xl">⛅</span>
        <div>
            <div className="text-sm font-bold text-white leading-none">12°C</div>
            <div className="text-[10px] text-gray-300 leading-none">Droog</div>
        </div>
    </div>
);

export default function HumanDashboard() {
    const [user, setUser] = useState<any>(null);
    const [bookings, setBookings] = useState<any[]>([]);
    const [invites, setInvites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [quickBookOpen, setQuickBookOpen] = useState(false);
    const [selectedBookingForScore, setSelectedBookingForScore] = useState<any>(null);

    // Mock data for "Live" features
    const livePlayers = [
        { id: 1, name: 'Sarah', avatar: 'https://i.pravatar.cc/150?u=sarah' },
        { id: 2, name: 'Mark', avatar: 'https://i.pravatar.cc/150?u=mark' },
        { id: 3, name: 'Tom', avatar: 'https://i.pravatar.cc/150?u=tom' },
    ];

    useEffect(() => {
        async function load() {
            try {
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    // Fetch Profile for XP/Level
                    const { data: profile } = await supabase
                        .from('user_profiles')
                        .select('xp, level')
                        .eq('id', user.id)
                        .single();

                    setUser({ ...user, profile });

                    // Fetch real bookings with Match Results
                    const { data: bookingsData } = await supabase
                        .from('bookings')
                        .select(`
                            *, 
                            court:courts(name), 
                            club:clubs(name),
                            match_results(set1_team1, set1_team2, set2_team1, set2_team2, set3_team1, set3_team2, winner_team)
                        `)
                        .eq('user_id', user.id)
                        // We halen ALLES op, zodat we historische data zien
                        .order('booking_date', { ascending: false })
                        .limit(20);

                    setBookings(bookingsData || []);

                    // Fetch Invites
                    const myInvites = await getIncomingInvites();
                    setInvites(myInvites || []);
                }
            } catch (error) {
                console.error("Error loading dashboard", error);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    // Helper to format score
    const formatScore = (result: any) => {
        if (!result) return "";
        let score = `${result.set1_team1}-${result.set1_team2}`;
        if (result.set2_team1 || result.set2_team2) score += ` ${result.set2_team1}-${result.set2_team2}`;
        if (result.set3_team1 || result.set3_team2) score += ` ${result.set3_team1}-${result.set3_team2}`;
        return score;
    };

    // Helper to check if a booking is in the past
    const isPast = (booking: any) => {
        // Use end_time if available, or just date
        const dateStr = booking.booking_date;
        const timeStr = booking.end_time || booking.start_time || "23:59";
        const endDateTime = new Date(`${dateStr}T${timeStr}`);
        return endDateTime < new Date();
    };

    // Smart Invite Function
    const handleInvite = async () => {
        // In real app: generate unique link
        const shareData = {
            title: 'Gamenight! 🎾',
            text: `Ik zoek nog een speler voor vanavond! Wie doet er mee?`,
            url: window.location.origin
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
                alert('Uitnodiging gekopieerd naar klembord! 📋');
            }
        } catch (err) {
            console.error('Error sharing:', err);
        }
    };

    // Filter bookings into upcoming and past
    const upcomingBookings = bookings.filter(b => !isPast(b)).reverse(); // Upcoming (soonest first)
    const pastBookings = bookings.filter(b => isPast(b));

    const nextSession = upcomingBookings[0];

    return (
        <div className="min-h-screen bg-[#0A1628] text-white relative font-sans">

            {/* Modal for scoring */}
            {selectedBookingForScore && (
                <ScoreSubmissionModal
                    isOpen={!!selectedBookingForScore}
                    onClose={() => setSelectedBookingForScore(null)}
                    booking={selectedBookingForScore}
                />
            )}

            {/* 1. IMMERSIVE ACHTERGROND - Fixed URL */}
            <div className="absolute inset-0 z-0 h-[50vh]">
                <div className="absolute inset-0 bg-gradient-to-b from-[#0A1628]/30 via-[#0A1628]/90 to-[#0A1628] z-10" />
                <img
                    src="https://images.unsplash.com/photo-1554068865-24cecd4e34b8?q=80&w=2070&auto=format&fit=crop"
                    alt="Club background"
                    className="w-full h-full object-cover opacity-50"
                />
            </div>

            <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24">

                {/* TOP BAR: Weather & Location */}
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-300">
                        <svg className="w-4 h-4 text-[#C4FF0D]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        CourtFlow Demo Club
                    </div>
                    <WeatherBadge />
                </div>

                {/* HERO HEADER */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-20 h-20 rounded-full border-4 border-white/10 overflow-hidden shadow-2xl relative">
                            <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-2xl font-bold">
                                {user?.email?.[0].toUpperCase() || 'U'}
                            </div>
                            {/* Online Status */}
                            <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-[#0A1628] rounded-full"></div>
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
                                Hoi, <span className="text-[#C4FF0D]">{user?.email?.split('@')[0] || 'Sporter'}</span>
                            </h1>
                            <div className="flex items-center gap-4 mt-2">
                                <span className="flex items-center gap-1 text-sm font-bold text-orange-400">
                                    🔥 3 Dagen Streak
                                </span>
                                <div className="flex flex-col">
                                    <span className="flex items-center gap-1 text-sm font-bold text-blue-400">
                                        🏆 Level {user?.profile?.level || 1}
                                    </span>
                                    {/* XP Bar */}
                                    <div className="w-32 h-1.5 bg-blue-500/20 rounded-full mt-1 overflow-hidden relative group">
                                        <div
                                            className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out"
                                            style={{
                                                width: `${Math.min(100, Math.max(0, (((user?.profile?.xp || 0) - ((user?.profile?.level || 1) - 1) * 500) / 500) * 100))}%`
                                            }}
                                        />
                                        {/* Tooltip on hover (simple title for now) */}
                                    </div>
                                    <span className="text-[10px] text-gray-500 font-mono mt-0.5">
                                        {(user?.profile?.xp || 0) % 500} / 500 XP
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Link href="/demo-club" className="w-full md:w-auto px-8 py-4 bg-[#C4FF0D] text-[#0A1628] font-bold text-lg rounded-2xl hover:scale-105 transition-transform shadow-[0_4px_20px_rgba(196,255,13,0.3)] flex justify-center items-center gap-2">
                        <span>Direct Boeken</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LINKER KOLOM: AGENDA & BOOKINGS */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* INVITES NOTIFICATION */}
                        {invites.length > 0 && (
                            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-6 border border-white/10 shadow-lg relative overflow-hidden">
                                <div className="relative z-10">
                                    <h3 className="font-bold text-white text-lg mb-2 flex items-center gap-2">
                                        <span className="animate-pulse">🔔</span> Je bent uitgenodigd!
                                    </h3>
                                    <div className="space-y-3">
                                        {invites.map((inv: any) => (
                                            <div key={inv.id} className="bg-white/10 rounded-xl p-3 flex items-center justify-between">
                                                <div>
                                                    <div className="font-bold text-white">{inv.booking.club?.name}</div>
                                                    <div className="text-xs text-blue-200">
                                                        {new Date(inv.booking.booking_date).toLocaleDateString()} • {inv.booking.start_time.slice(0, 5)}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                await respondToInvite(inv.id, true);
                                                                setInvites(invites.filter(i => i.id !== inv.id));
                                                                window.location.reload();
                                                            } catch (err: any) {
                                                                alert("Fout bij accepteren: " + err.message);
                                                            }
                                                        }}
                                                        className="px-3 py-1 bg-[#C4FF0D] text-[#0A1628] rounded-lg text-xs font-bold hover:scale-105 transition-transform"
                                                    >
                                                        Accepteren
                                                    </button>
                                                    <button
                                                        onClick={async () => {
                                                            await respondToInvite(inv.id, false);
                                                            setInvites(invites.filter(i => i.id !== inv.id));
                                                        }}
                                                        className="px-3 py-1 bg-white/10 text-white rounded-lg text-xs font-bold hover:bg-white/20 transition-colors"
                                                    >
                                                        Afwijzen
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Volgende Sessie Card (Groot) */}
                        <div>
                            <h3 className="text-gray-400 font-bold uppercase tracking-wider text-sm mb-4">Eerstvolgende Sessie</h3>
                            {nextSession ? (
                                <div className="relative overflow-hidden rounded-3xl border border-white/10 group cursor-pointer">
                                    <img
                                        src="https://images.unsplash.com/photo-1624653697960-aa228c2e633d?q=80&w=2670" // Real Padel Action
                                        className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                                        alt="Padel Match"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#0A1628] via-[#0A1628]/80 to-transparent" />

                                    <div className="relative p-8">
                                        <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur rounded-lg text-xs font-bold text-white mb-4">
                                            BINNENKORT
                                        </span>
                                        <h3 className="text-3xl font-bold text-white mb-2">{nextSession.club?.name || 'Padel Match'}</h3>
                                        <div className="text-[#C4FF0D] font-bold text-lg flex items-center gap-2 mb-6">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            {new Date(nextSession.booking_date).toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' })} • {nextSession.start_time.slice(0, 5)}
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="flex -space-x-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-500 border-2 border-[#0A1628]"></div>
                                                <div className="w-10 h-10 rounded-full bg-purple-500 border-2 border-[#0A1628]"></div>
                                            </div>
                                            <span className="text-sm text-gray-400">met Jou & Vrienden</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center hover:bg-white/10 transition-colors">
                                    <p className="text-gray-400 mb-4">Geen sessies gepland</p>
                                    <Link href="/demo-club" className="text-[#C4FF0D] font-bold hover:underline">Plan je eerste sessie →</Link>
                                </div>
                            )}
                        </div>

                        {/* Agenda Lijst (Mix van Upcoming en Past) */}
                        <div>
                            <h3 className="text-gray-400 font-bold uppercase tracking-wider text-sm mb-4">Mijn Agenda</h3>
                            <div className="bg-[#132338] rounded-3xl border border-white/5 overflow-hidden">
                                {bookings.length > 0 ? bookings.map((booking, i) => {
                                    const past = isPast(booking);
                                    // @ts-ignore
                                    const matchResult = Array.isArray(booking.match_results) ? booking.match_results[0] : booking.match_results;

                                    return (
                                        <div key={booking.id} className="p-4 border-b border-white/5 flex items-center hover:bg-white/5 transition-colors">
                                            <div className={`w-16 text-center border-r border-white/10 pr-4 mr-4 ${past ? 'opacity-50' : ''}`}>
                                                <div className="text-xs text-gray-400 uppercase font-bold">
                                                    {new Date(booking.booking_date).toLocaleDateString('nl-NL', { weekday: 'short' })}
                                                </div>
                                                <div className="text-xl font-bold text-white">
                                                    {new Date(booking.booking_date).getDate()}
                                                </div>
                                            </div>
                                            <div className={past ? 'opacity-50' : ''}>
                                                <div className="text-white font-bold">{booking.court?.name || 'Padel Court'}</div>
                                                <div className="text-sm text-gray-400">{booking.start_time.slice(0, 5)} • 90 min</div>
                                            </div>
                                            <div className="ml-auto">
                                                {past ? (
                                                    matchResult ? (
                                                        <div className="text-right">
                                                            <div className="text-[10px] uppercase font-bold text-gray-400">Uitslag</div>
                                                            <div className="text-[#C4FF0D] font-bold font-mono">{formatScore(matchResult)}</div>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => setSelectedBookingForScore(booking)}
                                                            className="px-3 py-1 rounded-full bg-[#C4FF0D]/10 text-xs font-bold text-[#C4FF0D] border border-[#C4FF0D]/20 hover:bg-[#C4FF0D] hover:text-black transition-colors"
                                                        >
                                                            Uitslag Invoeren
                                                        </button>
                                                    )
                                                ) : (
                                                    <Link href={`/bookings/${booking.id}`} className="px-3 py-1 rounded-full bg-white/5 text-xs font-bold text-gray-300 hover:text-white">
                                                        Details
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    )
                                }) : (
                                    <div className="p-8 text-center text-gray-500 text-sm">
                                        Nog geen boekingen gevonden.
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* RECHTER KOLOM: SOCIAL & TOOLS */}
                    <div className="space-y-6">

                        {/* Live op de club */}
                        <div className="bg-[#132338] p-6 rounded-3xl border border-white/5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-white flex items-center gap-2">
                                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                    Live op de club
                                </h3>
                                <span className="text-xs text-gray-400">12 spelers</span>
                            </div>
                            <div className="flex -space-x-3 mb-4">
                                {livePlayers.map(p => (
                                    <img key={p.id} src={p.avatar} className="w-10 h-10 rounded-full border-2 border-[#132338]" alt={p.name} />
                                ))}
                                <div className="w-10 h-10 rounded-full bg-gray-700 border-2 border-[#132338] flex items-center justify-center text-xs font-bold text-white">+9</div>
                            </div>
                            <Link href="/community" className="block w-full text-center py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold text-white transition-colors">
                                🏆 Community & Ranglijst
                            </Link>
                        </div>

                        {/* Snelle Acties */}
                        <div className="grid grid-cols-2 gap-4">
                            <Link href="/wallet" className="bg-[#132338] p-4 rounded-2xl border border-white/5 hover:border-[#C4FF0D]/50 transition-colors group">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                                </div>
                                <div className="font-bold text-white text-sm">Wallet</div>
                                <div className="text-xs text-gray-400">€170,00</div>
                            </Link>

                            {/* Link naar demo-club context voor challenges om "Club niet gevonden" te voorkomen */}
                            <Link href="/demo-club/bookings" className="bg-[#132338] p-4 rounded-2xl border border-white/5 hover:border-[#C4FF0D]/50 transition-colors group">
                                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                </div>
                                <div className="font-bold text-white text-sm">Challenges</div>
                                <div className="text-xs text-gray-400">3 Actief</div>
                            </Link>
                        </div>

                        {/* Invite Friend */}
                        <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-3xl relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="font-bold text-white mb-2">Gamenight?</h3>
                                <p className="text-blue-100 text-sm mb-4">Nodig je vrienden uit voor een potje.</p>
                                <button
                                    onClick={handleInvite}
                                    className="px-4 py-2 bg-white text-blue-900 font-bold rounded-lg text-sm hover:bg-blue-50 transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                                    Nodig uit
                                </button>
                            </div>
                            {/* Decorative elements */}
                            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                        </div>

                    </div>

                </div>
            </div>
        </div >
    );
}
