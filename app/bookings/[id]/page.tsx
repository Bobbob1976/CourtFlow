'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { invitePlayer, removeParticipant } from '@/app/actions/participant-actions';
import { Share2, Calendar } from 'lucide-react';

export default function BookingDetailsPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const [booking, setBooking] = useState<any>(null);
    const [participants, setParticipants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [inviteEmail, setInviteEmail] = useState("");
    const [isInviting, setIsInviting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            const supabase = createClient();

            // 1. Booking
            const { data: bookingData, error } = await supabase
                .from('bookings')
                .select('*, court:courts(name), club:clubs(name)') // SAFE JOIN
                .eq('id', id)
                .single();

            if (error) {
                console.error(error);
                setError(error.message || "Kan boeking niet vinden."); // Show real error
            } else {
                setBooking(bookingData);

                // 2. Participants
                const { data: partData } = await supabase
                    .from('booking_participants')
                    .select('*')
                    .eq('booking_id', id);
                setParticipants(partData || []);
            }
            setLoading(false);
        }
        load();
    }, [id]);

    const handleInvite = async () => {
        if (!inviteEmail) return;
        setIsInviting(true);
        try {
            await invitePlayer(id, inviteEmail);
            alert("Uitnodiging verstuurd!");
            setInviteEmail("");
            window.location.reload();
        } catch (e: any) {
            alert(e.message);
        }
        setIsInviting(false);
    };

    const handleShare = async () => {
        if (!booking) return;
        const shareData = {
            title: 'Potje Padel?',
            text: `Ik heb een baan geboekt bij ${booking.club?.name} op ${new Date(booking.booking_date).toLocaleDateString()} om ${booking.start_time.slice(0, 5)}. Doe je mee?`,
            url: window.location.href
        };
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
                alert('Link gekopieerd!');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleCalendar = () => {
        if (!booking) return;
        const start = new Date(`${booking.booking_date}T${booking.start_time}`).toISOString().replace(/-|:|\.\d\d\d/g, "");
        const end = new Date(new Date(`${booking.booking_date}T${booking.start_time}`).getTime() + 90 * 60000).toISOString().replace(/-|:|\.\d\d\d/g, "");
        const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Padel+bij+${encodeURIComponent(booking.club?.name)}&dates=${start}/${end}&details=Geboekt+via+CourtFlow&location=${encodeURIComponent(booking.club?.address || booking.club?.city)}`;
        window.open(url, '_blank');
    };

    if (loading) return <div className="min-h-screen bg-[#0A1628] flex items-center justify-center text-white">Laden...</div>;
    if (error) return <div className="min-h-screen bg-[#0A1628] flex items-center justify-center text-red-400">{error}</div>;
    if (!booking) return <div className="min-h-screen bg-[#0A1628] flex items-center justify-center text-white">Boeking niet gevonden.</div>;

    return (
        <div className="min-h-screen bg-[#0A1628] text-white">
            <div className="max-w-md mx-auto p-6 space-y-6">

                {/* Header Back */}
                <Link href="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white mb-4">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    <span>Terug</span>
                </Link>

                {/* Status Card */}
                <div className="bg-[#132338] rounded-3xl p-8 text-center border border-white/5 relative overflow-hidden shadow-2xl">
                    <div className="relative z-10">
                        <div className="inline-block px-4 py-1 rounded-full bg-[#C4FF0D]/20 text-[#C4FF0D] font-bold text-sm mb-4 border border-[#C4FF0D]/30">
                            BEVESTIGD
                        </div>
                        <h1 className="text-3xl font-extrabold text-white mb-2">{booking.club?.name}</h1>
                        <div className="text-gray-400 font-medium mb-6">{booking.court?.name}</div>

                        <div className="flex justify-center items-center gap-6 mb-8">
                            <div className="text-right">
                                <div className="text-2xl font-bold text-white">{new Date(booking.booking_date).getDate()}</div>
                                <div className="text-xs text-gray-500 uppercase font-bold">{new Date(booking.booking_date).toLocaleDateString('nl-NL', { month: 'short' })}</div>
                            </div>
                            <div className="w-px h-10 bg-white/10"></div>
                            <div className="text-left">
                                <div className="text-2xl font-bold text-white">{booking.start_time.slice(0, 5)}</div>
                                <div className="text-xs text-gray-500 uppercase font-bold">90 min</div>
                            </div>
                        </div>

                        {/* PLAYERS SECTION */}
                        <div className="bg-white/5 rounded-2xl p-4 mb-6 text-left">
                            <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 px-1">Spelers ({participants.length + 1})</h3>
                            <div className="space-y-2">
                                {/* Owner (You) */}
                                <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/5">
                                    <div className="w-8 h-8 rounded-full bg-[#C4FF0D] flex items-center justify-center text-[#0A1628] font-bold text-xs">IK</div>
                                    <span className="text-sm font-bold">Jij (Host)</span>
                                </div>

                                {/* Invited Players */}
                                {participants.map(p => (
                                    <div key={p.id} className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/5 justify-between group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold text-xs uppercase">
                                                {p.email[0]}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold">{p.email.split('@')[0]}</span>
                                                <span className="text-[10px] text-gray-400 capitalize">{p.status}</span>
                                            </div>
                                        </div>
                                        {/* Remove Button (Owner only) */}
                                        <button onClick={async () => {
                                            if (confirm("Verwijderen?")) {
                                                await removeParticipant(p.id, id);
                                                window.location.reload();
                                            }
                                        }} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Invite Input */}
                            <div className="mt-4 pt-4 border-t border-white/5 flex gap-2">
                                <input
                                    type="email"
                                    placeholder="friend@email.com"
                                    className="bg-[#0A1628] border border-white/10 rounded-lg px-3 py-2 text-sm text-white w-full focus:outline-none focus:border-[#C4FF0D]"
                                    value={inviteEmail}
                                    onChange={e => setInviteEmail(e.target.value)}
                                />
                                <button
                                    onClick={handleInvite}
                                    disabled={isInviting || !inviteEmail}
                                    className="bg-[#C4FF0D] text-[#0A1628] p-2 rounded-lg font-bold hover:scale-105 transition-transform disabled:opacity-50"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={handleShare}
                        className="bg-[#132338] hover:bg-[#1e293b] text-white py-4 rounded-2xl font-bold flex flex-col items-center gap-2 border border-white/5 transition-colors"
                    >
                        <Share2 className="w-6 h-6 text-blue-400" />
                        <span className="text-sm">Delen</span>
                    </button>
                    <button
                        onClick={handleCalendar}
                        className="bg-[#132338] hover:bg-[#1e293b] text-white py-4 rounded-2xl font-bold flex flex-col items-center gap-2 border border-white/5 transition-colors"
                    >
                        <Calendar className="w-6 h-6 text-[#C4FF0D]" />
                        <span className="text-sm">In Agenda</span>
                    </button>
                </div>

                {/* Cancel Link */}
                <div className="text-center pt-4">
                    <button className="text-red-400 text-sm font-medium hover:text-red-300 transition-colors">
                        Boeking Annuleren
                    </button>
                </div>

            </div>
        </div>
    );
}
