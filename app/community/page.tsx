'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

export default function CommunityPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        async function load() {
            const supabase = createClient();

            // Get current user
            const { data: { user: currentUser } } = await supabase.auth.getUser();

            // Fetch profiles
            // Note: This relies on RLS allowing read access to other profiles
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .neq('id', currentUser?.id || '') // Exclude self
                .order('xp', { ascending: false }); // Sort by Ranking/XP

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

    return (
        <div className="min-h-screen bg-[#0A1628] text-white pb-20">
            {/* Header */}
            <div className="bg-[#132338] border-b border-white/5 p-6 sticky top-0 z-10 shadow-xl">
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-extrabold text-white">Community</h1>
                            <p className="text-gray-400 text-sm">Vind spelers en buddies</p>
                        </div>
                    </div>

                    {/* Search */}
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
            </div>

            {/* Grid */}
            <div className="max-w-4xl mx-auto p-6">
                {loading ? (
                    <div className="text-center py-12 text-gray-500">Spelers laden...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredUsers.map(user => (
                            <div key={user.id} className="bg-[#132338] rounded-2xl p-6 border border-white/5 hover:border-[#C4FF0D]/50 transition-all group relative overflow-hidden">
                                {/* Rank Badge */}
                                <div className="absolute top-0 right-0 bg-[#C4FF0D] text-[#0A1628] text-xs font-bold px-3 py-1 rounded-bl-xl origin-top-right scale-0 group-hover:scale-100 transition-transform">
                                    LEVEL {user.level || 1}
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full border-2 border-white/10 overflow-hidden bg-gray-700">
                                        {user.avatar_url ? (
                                            <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xl font-bold text-gray-400">
                                                {(user.full_name?.[0] || 'U')}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg">{user.full_name || 'Naamloos'}</h3>
                                        <p className="text-sm text-gray-400 flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            {user.location || 'Onbekend'}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-6 flex gap-2">
                                    <button
                                        className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2 rounded-lg font-bold text-sm transition-colors"
                                        onClick={() => alert('Chat coming soon!')}
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

                        {filteredUsers.length === 0 && (
                            <div className="col-span-full text-center py-12 text-gray-500">
                                Geen spelers gevonden.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
