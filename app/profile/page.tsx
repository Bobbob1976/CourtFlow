'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        full_name: '',
        location: ''
    });

    const [matches, setMatches] = useState<any[]>([]);

    useEffect(() => {
        async function load() {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);

                // 1. Profile
                const { data } = await supabase.from('user_profiles').select('*').eq('id', user.id).single();
                setProfile(data);
                setEditForm({
                    full_name: data?.full_name || user.email?.split('@')[0] || '',
                    location: data?.location || 'Amsterdam'
                });

                // 2. Matches
                const { data: matchData } = await supabase
                    .from('bookings')
                    .select('*, match_results(*)')
                    .eq('user_id', user.id)
                    .not('match_results', 'is', null)
                    .order('booking_date', { ascending: false })
                    .limit(10);

                setMatches(matchData || []);
            }
            setLoading(false);
        }
        load();
    }, []);

    const handleSave = async () => {
        const supabase = createClient();
        const { error } = await supabase
            .from('user_profiles')
            .update({
                full_name: editForm.full_name,
                location: editForm.location
            })
            .eq('id', user.id);

        if (error) {
            alert('Fout bij opslaan: ' + error.message);
        } else {
            setProfile({ ...profile, ...editForm });
            setIsEditing(false);
        }
    };

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0) return;

        const file = event.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const supabase = createClient();
        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file);

        if (uploadError) {
            alert('Upload mislukt: ' + uploadError.message);
            return;
        }

        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

        // Update profile
        await supabase.from('user_profiles').update({ avatar_url: publicUrl }).eq('id', user.id);

        // Update local state
        setProfile({ ...profile, avatar_url: publicUrl });
    };

    if (loading) return <div className="min-h-screen bg-[#0A1628] flex items-center justify-center text-white">Laden...</div>;

    // Calc Stats
    const totalMatches = matches.length;
    const wins = matches.filter(m => {
        const res = Array.isArray(m.match_results) ? m.match_results[0] : m.match_results;
        return res?.winner_team === 'team1'; // Assumption: user is team1 owner
    }).length;
    const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

    return (
        <div className="min-h-screen bg-[#0A1628] text-white pb-20 font-sans">

            {/* HEADER */}
            <div className="bg-[#132338] border-b border-white/5 pb-8 pt-12 px-4 shadow-xl relative z-10">
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8">

                    {/* AVATAR */}
                    <div className="relative group cursor-pointer" onClick={() => isEditing && document.getElementById('avatar-upload')?.click()}>
                        <div className="w-32 h-32 rounded-full border-4 border-[#C4FF0D] overflow-hidden shadow-[0_0_30px_rgba(196,255,13,0.3)]">
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-4xl font-bold">
                                    {user?.email?.[0].toUpperCase() || 'U'}
                                </div>
                            )}
                        </div>
                        {isEditing && (
                            <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                                <span className="text-xs font-bold text-white">📷 Wijzig</span>
                            </div>
                        )}
                        {!isEditing && <div className="absolute bottom-0 right-0 bg-[#C4FF0D] text-[#0A1628] text-xs font-bold px-3 py-1 rounded-full border border-[#0A1628]">ELITE</div>}
                        <input
                            type="file"
                            id="avatar-upload"
                            className="hidden"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                        />
                    </div>

                    {/* INFO & EDIT FORM */}
                    <div className="text-center md:text-left flex-1">
                        {isEditing ? (
                            <div className="space-y-3 animation-fade-in">
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase block mb-1">Naam</label>
                                    <input
                                        type="text"
                                        value={editForm.full_name}
                                        onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                                        className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white font-bold w-full md:w-64 focus:outline-none focus:border-[#C4FF0D]"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase block mb-1">Locatie</label>
                                    <input
                                        type="text"
                                        value={editForm.location}
                                        onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                                        className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white font-bold w-full md:w-64 focus:outline-none focus:border-[#C4FF0D]"
                                    />
                                </div>
                            </div>
                        ) : (
                            <>
                                <h1 className="text-3xl font-extrabold text-white mb-2">{profile?.full_name || editForm.full_name}</h1>
                                <p className="text-gray-400 mb-4">Padel Enthusiast • {editForm.location}</p>
                            </>
                        )}

                        {/* ACTION BUTTONS */}
                        <div className="flex justify-center md:justify-start gap-3 mt-4">
                            {isEditing ? (
                                <>
                                    <button
                                        onClick={handleSave}
                                        className="px-6 py-2 bg-[#C4FF0D] text-[#0A1628] rounded-lg font-bold text-sm hover:scale-105 transition-transform shadow-lg shadow-[#C4FF0D]/20"
                                    >
                                        Opslaan
                                    </button>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="px-4 py-2 bg-white/10 rounded-lg font-bold text-sm hover:bg-white/20 transition-colors"
                                    >
                                        Annuleren
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="px-4 py-2 bg-white/10 rounded-lg font-bold text-sm hover:bg-white/20 transition-colors border border-white/5 flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                        Edit Profile
                                    </button>
                                    <Link
                                        href="/settings"
                                        className="px-4 py-2 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        Settings
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="ml-auto flex gap-6 text-center">
                        <div>
                            <div className="text-2xl font-bold text-white">{totalMatches}</div>
                            <div className="text-xs text-gray-500 uppercase font-bold">Matches</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-[#C4FF0D]">{winRate}%</div>
                            <div className="text-xs text-gray-500 uppercase font-bold">Win Rate</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-blue-400">{profile?.ntrp || '4.2'}</div>
                            <div className="text-xs text-gray-500 uppercase font-bold">NTRP</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 mt-12 space-y-8">

                {/* RIGHT: HISTORY & BADGES */}
                <div className="space-y-8">

                    {/* Level Progress */}
                    <div className="bg-[#132338] rounded-3xl p-8 border border-white/5 shadow-lg">
                        <div className="flex justify-between items-end mb-4">
                            <div>
                                <div className="text-gray-400 text-xs font-bold uppercase mb-1">Huidig Level</div>
                                <div className="text-3xl font-extrabold text-white">Level {profile?.level || 1}</div>
                            </div>
                            <div className="text-[#C4FF0D] font-bold">{(profile?.xp || 0) % 500} / 500 XP</div>
                        </div>
                        <div className="w-full bg-gray-700 h-3 rounded-full overflow-hidden">
                            <div
                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-1000"
                                style={{ width: `${((profile?.xp || 0) % 500) / 5}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-3">
                            Nog {500 - ((profile?.xp || 0) % 500)} XP voor Level {(profile?.level || 1) + 1}!
                        </p>
                    </div>

                    {/* Recent Activity */}
                    <div>
                        <h3 className="text-gray-400 font-bold uppercase text-sm mb-4">Laatste Matches ({matches.length})</h3>
                        <div className="space-y-4">
                            {matches.length > 0 ? matches.map((m, i) => {
                                // Safe Access
                                const res = Array.isArray(m.match_results) ? m.match_results[0] : m.match_results;
                                if (!res) return null; // Skip if no result

                                const isWin = res.winner_team === 'team1';
                                const xpGain = isWin ? 150 : (res.winner_team === 'draw' ? 75 : 50);
                                const date = new Date(m.booking_date).toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' });

                                // Format score
                                let score = `${res.set1_team1}-${res.set1_team2}`;
                                if (res.set2_team1 || res.set2_team2) score += `, ${res.set2_team1}-${res.set2_team2}`;

                                return (
                                    <div key={m.id} className="flex items-center justify-between bg-[#132338] p-4 rounded-2xl border border-white/5 hover:border-[#C4FF0D]/30 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-2 h-12 rounded-full ${isWin ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                            <div>
                                                <div className="font-bold text-white">{isWin ? 'Winst' : 'Verlies'} vs Tegenstander</div>
                                                <div className="text-xs text-gray-500 capitalize">{date} • {score}</div>
                                            </div>
                                        </div>
                                        <div className="font-bold text-gray-300">+{xpGain} XP</div>
                                    </div>
                                )
                            }) : (
                                <div className="text-gray-500 text-sm">Nog geen matches gespeeld.</div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
