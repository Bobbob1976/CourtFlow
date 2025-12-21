'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SettingsPage() {
    const [settings, setSettings] = useState({
        notifications: true,
        darkMode: true,
        publicProfile: true,
        emailDigest: false
    });

    const toggle = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="min-h-screen bg-[#0A1628] text-white pt-12 pb-20 font-sans">
            <div className="max-w-3xl mx-auto px-4">

                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/profile" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </Link>
                    <h1 className="text-3xl font-extrabold">Instellingen</h1>
                </div>

                <div className="space-y-6">

                    {/* General Settings */}
                    <div className="bg-[#132338] rounded-3xl border border-white/5 overflow-hidden">
                        <div className="px-6 py-4 border-b border-white/5 bg-white/5">
                            <h2 className="font-bold text-gray-200">Algemeen</h2>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-bold text-white">Dark Mode 🌙</div>
                                    <div className="text-xs text-gray-400">Gebruik het donkere thema (aanbevolen)</div>
                                </div>
                                <button
                                    onClick={() => toggle('darkMode')}
                                    className={`w-12 h-6 rounded-full transition-colors relative ${settings.darkMode ? 'bg-[#C4FF0D]' : 'bg-gray-600'}`}
                                >
                                    <div className={`w-4 h-4 rounded-full bg-[#0A1628] absolute top-1 transition-all ${settings.darkMode ? 'left-7' : 'left-1'}`}></div>
                                </button>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-bold text-white">Publiek Profiel 🌍</div>
                                    <div className="text-xs text-gray-400">Andere spelers kunnen je stats zien</div>
                                </div>
                                <button
                                    onClick={() => toggle('publicProfile')}
                                    className={`w-12 h-6 rounded-full transition-colors relative ${settings.publicProfile ? 'bg-[#C4FF0D]' : 'bg-gray-600'}`}
                                >
                                    <div className={`w-4 h-4 rounded-full bg-[#0A1628] absolute top-1 transition-all ${settings.publicProfile ? 'left-7' : 'left-1'}`}></div>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Notifications */}
                    <div className="bg-[#132338] rounded-3xl border border-white/5 overflow-hidden">
                        <div className="px-6 py-4 border-b border-white/5 bg-white/5">
                            <h2 className="font-bold text-gray-200">Notificaties</h2>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-bold text-white">Push Meldingen 🔔</div>
                                    <div className="text-xs text-gray-400">Ontvang meldingen bij nieuwe challenges</div>
                                </div>
                                <button
                                    onClick={() => toggle('notifications')}
                                    className={`w-12 h-6 rounded-full transition-colors relative ${settings.notifications ? 'bg-[#C4FF0D]' : 'bg-gray-600'}`}
                                >
                                    <div className={`w-4 h-4 rounded-full bg-[#0A1628] absolute top-1 transition-all ${settings.notifications ? 'left-7' : 'left-1'}`}></div>
                                </button>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-bold text-white">Wekelijkse Digest 📧</div>
                                    <div className="text-xs text-gray-400">Email samenvatting van je stats</div>
                                </div>
                                <button
                                    onClick={() => toggle('emailDigest')}
                                    className={`w-12 h-6 rounded-full transition-colors relative ${settings.emailDigest ? 'bg-[#C4FF0D]' : 'bg-gray-600'}`}
                                >
                                    <div className={`w-4 h-4 rounded-full bg-[#0A1628] absolute top-1 transition-all ${settings.emailDigest ? 'left-7' : 'left-1'}`}></div>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-red-500/10 rounded-3xl border border-red-500/20 overflow-hidden">
                        <div className="p-6">
                            <h3 className="font-bold text-red-400 mb-2">Account Verwijderen</h3>
                            <p className="text-xs text-gray-400 mb-4">Dit kan niet ongedaan worden gemaakt. Al je data en matches worden gewist.</p>
                            <button className="px-4 py-2 border border-red-500/30 text-red-400 rounded-lg text-sm font-bold hover:bg-red-500/10 transition-colors">
                                Verwijder mijn account
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
