'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

export default function KillerDashboard() {
    const [userName, setUserName] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase.from('user_profiles').select('full_name').eq('id', user.id).single();
                setUserName(profile?.full_name?.split(' ')[0] || 'Sporter');
            }
            setLoading(false);
        }
        load();
    }, []);

    return (
        <div className="min-h-screen text-white pb-20">

            {/* Dynamic Background Mesh */}
            <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[0%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

                {/* Hero Section */}
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <p className="text-gray-400 font-medium mb-1 tracking-wide uppercase text-xs">Welkom terug</p>
                        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                            {loading ? '...' : `Hi, ${userName}`}
                        </h1>
                    </div>
                    <Link
                        href="/demo-club"
                        className="btn-primary-glow px-8 py-4 text-black text-lg shadow-2xl flex items-center gap-2"
                    >
                        <span>Boek een Baan</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                </div>

                {/* Stats Row - High-End Floating Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    <div className="cockpit-card p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <svg className="w-24 h-24 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" /></svg>
                        </div>
                        <div className="text-gray-400 text-sm font-medium mb-2">Aankomende Sessies</div>
                        <div className="text-4xl font-bold text-white mb-1">3</div>
                        <div className="text-xs text-green-400 font-medium flex items-center gap-1">
                            <span>●</span> Eerstvolgende: Vandaag 14:00
                        </div>
                    </div>

                    <div className="cockpit-card p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <svg className="w-24 h-24 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 001-.89l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" /></svg>
                        </div>
                        <div className="text-gray-400 text-sm font-medium mb-2">Wallet Saldo</div>
                        <div className="text-4xl font-bold text-white mb-1">€170,00</div>
                        <div className="text-xs text-blue-400 font-medium cursor-pointer hover:underline">
                            + Opwaarderen
                        </div>
                    </div>

                    <div className="cockpit-card p-6 relative overflow-hidden group col-span-2 bg-gradient-to-br from-gray-900 to-black border-blue-500/20">
                        <div className="flex justify-between items-start h-full">
                            <div>
                                <div className="text-blue-400 text-sm font-bold tracking-wider uppercase mb-2">Pro Lidmaatschap</div>
                                <div className="text-3xl font-bold text-white mb-2">Level 4: Elite</div>
                                <div className="w-full bg-gray-800 h-2 rounded-full mt-4 overflow-hidden max-w-[200px]">
                                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-full w-[70%] rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                                </div>
                                <div className="text-xs text-gray-500 mt-2">1200 / 1500 XP tot volgend level</div>
                            </div>
                            <div className="h-full flex items-center">
                                <div className="w-16 h-16 rounded-full border-4 border-blue-500/30 flex items-center justify-center text-xl font-bold bg-blue-500/10">
                                    IV
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Agenda (2/3 width) */}
                    <div className="lg:col-span-2 space-y-6">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                            Agenda
                        </h3>

                        {/* Booking Item */}
                        <div className="cockpit-card p-0 flex flex-col md:flex-row overflow-hidden group hover:border-blue-500/40 cursor-pointer">
                            <div className="bg-gray-800 w-full md:w-32 flex flex-col items-center justify-center p-4 border-b md:border-b-0 md:border-r border-gray-700/50 group-hover:bg-blue-900/10 transition-colors">
                                <span className="text-sm text-gray-400 font-medium uppercase">Vandaag</span>
                                <span className="text-3xl font-bold text-white">14:00</span>
                            </div>
                            <div className="p-6 flex-grow flex justify-between items-center">
                                <div>
                                    <h4 className="text-lg font-bold text-white mb-1">Padel Training</h4>
                                    <p className="text-gray-400 text-sm flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        CourtFlow Demo Club • Baan 3
                                    </p>
                                </div>
                                <div className="hidden md:block">
                                    <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20">
                                        BEVESTIGD
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Booking Item */}
                        <div className="cockpit-card p-0 flex flex-col md:flex-row overflow-hidden group hover:border-purple-500/40 cursor-pointer">
                            <div className="bg-gray-800 w-full md:w-32 flex flex-col items-center justify-center p-4 border-b md:border-b-0 md:border-r border-gray-700/50 group-hover:bg-purple-900/10 transition-colors">
                                <span className="text-sm text-gray-400 font-medium uppercase">Morgen</span>
                                <span className="text-3xl font-bold text-white">19:30</span>
                            </div>
                            <div className="p-6 flex-grow flex justify-between items-center">
                                <div>
                                    <h4 className="text-lg font-bold text-white mb-1">Wedstrijd vs. Mark</h4>
                                    <p className="text-gray-400 text-sm flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        CourtFlow Demo Club • Center Court
                                    </p>
                                </div>
                                <div>
                                    <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold border border-blue-500/20">
                                        COMPETITIEF
                                    </span>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Widgets (1/3 width) */}
                    <div className="space-y-6">

                        {/* Quick Actions */}
                        <div className="cockpit-card p-6">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Snel Menu</h3>
                            <div className="space-y-3">
                                <Link href="/wallet" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group">
                                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                                    </div>
                                    <span className="font-medium">Wallet & Betalingen</span>
                                    <svg className="w-4 h-4 text-gray-600 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </Link>
                                <Link href="/profile" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group">
                                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    </div>
                                    <span className="font-medium">Mijn Profiel</span>
                                    <svg className="w-4 h-4 text-gray-600 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </Link>
                                <Link href="/help" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group">
                                    <div className="w-10 h-10 rounded-lg bg-green-500/20 text-green-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                    <span className="font-medium">Support</span>
                                    <svg className="w-4 h-4 text-gray-600 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </Link>
                            </div>
                        </div>

                        {/* Weather / Status (Minimal) */}
                        <div className="cockpit-card p-6 bg-gradient-to-br from-blue-900/20 to-transparent">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Amsterdam</h3>
                                <span className="text-xs px-2 py-1 bg-white/10 rounded text-gray-300">Live</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-3xl font-bold text-white">12°C</div>
                                    <div className="text-sm text-gray-400">Licht bewolkt</div>
                                </div>
                                <div className="text-5xl">⛅</div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
