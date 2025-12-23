'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

export default function CommunityPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<'members' | 'leaderboard'>('members');

    useEffect(() => {
        async function load() {
            const supabase = createClient();

            // Get current user
            const { data: { user: currentUser } } = await supabase.auth.getUser();

            // Fetch profiles
            // Note: This relies on RLS allowing read access to other profiles
            // We order by XP descending, so this is effectively already a leaderboard
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                // .neq('id', currentUser?.id || '') // We usually WANT to see ourselves in the leaderboard!
                .order('xp', { ascending: false });

            if (data) {
                setUsers(data);
            }
            setLoading(false);
        }
        load();
    }, []);

    const filteredUsers = users.filter(u =>
        (u.full_name?.toLowerCase().includes(search.toLowerCase())) ||
        (u.location?.toLowerCase().includes(search.toLowerCase()))
    );

    // Leaderboard logic: Top 10 from the filtered list (or full list if we want pure ranking)
    const leaderboardUsers = users.slice(0, 50); // Show top 50 in leaderboard

    return (
        <div className="min-h-screen bg-[#0A1628] text-white pb-20">
            {/* Header */}
            <div className="bg-[#132338] border-b border-white/5 sticky top-0 z-10 shadow-xl">
                <div className="p-6 pb-0 max-w-4xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-extrabold text-white">Community</h1>
                                <p className="text-gray-400 text-sm">Vind spelers en bekijk de ranglijst</p>
                            </div>
                        </div>

                        {/* Search (only relevant for filtering member list, arguably for leaderboard too) */}
                        <div className="relative w-full md:w-64">
                            <input
                                type="text"
                                placeholder="Zoek op naam of stad..."
                                className="w-full bg-[#0A1628] border border-white/10 rounded-xl px-4 py-2 pl-10 text-white focus:outline-none focus:border-[#C4FF0D]"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <svg className="w-5 h-5 text-gray-500 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-8 border-b border-white/5">
                        <button
                            onClick={() => setActiveTab('members')}
                            className={`pb-4 px-2 text-sm font-bold transition-all relative ${activeTab === 'members' ? 'text-[#C4FF0D]' : 'text-gray-400 hover:text-white'}`}
                        >
                            Leden
                            {activeTab === 'members' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#C4FF0D]" />}
                        </button>
                        <button
                            onClick={() => setActiveTab('leaderboard')}
                            className={`pb-4 px-2 text-sm font-bold transition-all relative ${activeTab === 'leaderboard' ? 'text-[#C4FF0D]' : 'text-gray-400 hover:text-white'}`}
                        >
                            Ranglijst 🏆
                            {activeTab === 'leaderboard' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#C4FF0D]" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto p-6">
                {loading ? (
                    <div className="text-center py-12 text-gray-500">Spelers laden...</div>
                ) : (
                    <>
                        {/* VIEW: MEMBERS GRID */}
                        {activeTab === 'members' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredUsers.map(user => (
                                    <div key={user.id} className="bg-[#132338] rounded-2xl p-6 border border-white/5 hover:border-[#C4FF0D]/50 transition-all group relative overflow-hidden">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-full border-2 border-white/10 overflow-hidden bg-gray-700">
                                                {user.avatar_url ? (
                                                    <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xl font-bold text-gray-400">
                                                        {(user.full_name?.[0]?.toUpperCase() || 'U')}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white text-lg">{user.full_name || 'Naamloos'}</h3>
                                                <p className="text-sm text-gray-400">{user.location || 'Onbekend'}</p>
                                            </div>
                                        </div>

                                        <div className="mt-6 flex gap-2">
                                            <button
                                                className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2 rounded-lg font-bold text-sm transition-colors"
                                                onClick={() => window.location.href = `mailto:${user.email}`}
                                            >
                                                Bericht
                                            </button>
                                            <div className="text-right flex-1">
                                                <div className="text-xl font-bold text-[#C4FF0D]">{user.xp || 0}</div>
                                                <div className="text-[10px] text-gray-500 uppercase font-bold">XP Punten</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {filteredUsers.length === 0 && <div className="text-gray-500 text-center col-span-full">Geen leden gevonden.</div>}
                            </div>
                        )}

                        {/* VIEW: LEADERBOARD LIST */}
                        {activeTab === 'leaderboard' && (
                            <div className="space-y-2">
                                {leaderboardUsers.map((user, index) => {
                                    const rank = index + 1;
                                    let rankColor = 'text-white';
                                    let trophy = null;
                                    let bgClass = 'bg-[#132338]';

                                    if (rank === 1) {
                                        rankColor = 'text-yellow-400';
                                        trophy = '👑';
                                        bgClass = 'bg-gradient-to-r from-yellow-900/20 to-[#132338] border-yellow-500/30';
                                    } else if (rank === 2) {
                                        rankColor = 'text-gray-300';
                                        trophy = '🥈';
                                        bgClass = 'bg-gradient-to-r from-gray-700/20 to-[#132338] border-gray-400/30';
                                    } else if (rank === 3) {
                                        rankColor = 'text-amber-700';
                                        trophy = '🥉';
                                        bgClass = 'bg-gradient-to-r from-amber-900/20 to-[#132338] border-amber-600/30';
                                    }

                                    return (
                                        <div key={user.id} className={`${bgClass} rounded-2xl p-4 flex items-center gap-6 border border-white/5 hover:bg-white/5 transition-colors`}>
                                            <div className={`w-8 text-2xl font-black text-center ${rankColor}`}>
                                                {trophy || rank}
                                            </div>

                                            <div className="w-12 h-12 rounded-full border-2 border-white/10 overflow-hidden bg-gray-800 flex-shrink-0">
                                                {user.avatar_url ? (
                                                    <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-lg font-bold text-gray-400">
                                                        {(user.full_name?.[0]?.toUpperCase() || 'U')}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1">
                                                <h3 className="font-bold text-white text-lg flex items-center gap-2">
                                                    {user.full_name || 'Naamloos'}
                                                    {rank === 1 && <span className="text-[10px] bg-yellow-400 text-black px-1.5 rounded font-black">CHAMPION</span>}
                                                </h3>
                                                <div className="text-gray-400 text-sm flex items-center gap-2">
                                                    <span>Level {user.level || 1}</span>
                                                    <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                                                    <span>{user.location || 'Global'}</span>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <div className="text-2xl font-black text-[#C4FF0D] tabular-nums">{user.xp || 0}</div>
                                                <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">XP</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
