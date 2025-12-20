"use client";

import { format, isToday, isTomorrow } from "date-fns";
import { nl } from "date-fns/locale";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

interface VisualBookingCardProps {
    booking: any;
    onCancelled?: () => void;
}

export default function VisualBookingCard({ booking, onCancelled }: VisualBookingCardProps) {
    const [isCancelling, setIsCancelling] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const supabase = createClient();
    const router = useRouter();

    const handleCancel = async () => {
        setIsCancelling(true);
        try {
            const { error } = await supabase.rpc('cancel_booking', {
                p_booking_id: booking.id,
                p_reason: 'Cancelled by user'
            });

            if (error) throw error;

            // Refresh the server-side data
            if (onCancelled) {
                onCancelled();
            } else {
                router.refresh(); // Smoother than window.location.reload()
            }
        } catch (error: any) {
            console.error('Error cancelling booking:', error);
            alert(`Fout bij annuleren: ${error.message}`);
        } finally {
            setIsCancelling(false);
            setShowConfirm(false);
        }
    };
    const date = new Date(booking.booking_date);
    const dayLabel = isToday(date) ? 'Vandaag' : isTomorrow(date) ? 'Morgen' : format(date, 'EEEE', { locale: nl });
    const dateLabel = format(date, 'd MMM');
    const timeLabel = booking.start_time.slice(0, 5);

    // Determine tags based on court/sport
    const isPadel = booking.court.sport.toLowerCase() === 'padel';

    // Use booking ID to consistently determine color (prevents hydration mismatch)
    const colors = ['Blue', 'green', 'navyBlue', 'orange', 'Paars', 'pink', 'Red', 'yellow', 'zwart'];
    const colorIndex = booking.id.charCodeAt(0) % colors.length;
    const courtColor = colors[colorIndex];

    const tags = isPadel
        ? [{ label: 'INDOOR', color: 'blue' }, { label: 'PANORAMA', color: 'purple' }]
        : [{ label: 'CLAY', color: 'orange' }, { label: 'OUTDOOR', color: 'green' }];

    // Array met alle padel actie afbeeldingen
    const padelImages = [
        '/images/padel/padel_action_red.png',
        '/images/padel/padel_action_blue.png',
        '/images/padel/padel_action_orange.png',
        '/images/padel/padel_serve_action.png',
        '/images/padel/padel_volley_purple.png',
        '/images/padel/padel_doubles_green.png',
        '/images/padel/padel_smash_yellow.png',
        '/images/padel/padel_celebration_cyan.png',
        '/images/padel/padel_backhand_pink.png',
    ];

    // Consistente afbeelding selectie op basis van booking ID
    const hash = booking.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    const imagePath = padelImages[hash % padelImages.length];

    return (
        <div className="relative h-48 rounded-3xl overflow-hidden group cursor-pointer shadow-2xl shadow-black/40 border border-white/10">
            {/* Background Image (Dimmed) */}
            <div className="absolute inset-0 bg-[#1a1a1a]">
                <div
                    className="absolute inset-0 opacity-70 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{ backgroundImage: `url('${imagePath}')` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/60 to-transparent"></div>
            </div>

            {/* Content Overlay */}
            <div className="absolute inset-0 p-6 flex flex-col justify-between">
                {/* Top: Tags */}
                <div className="flex gap-2">
                    {tags.map((tag, i) => (
                        <span key={i} className={`text-[10px] font-extrabold px-2 py-1 rounded-md backdrop-blur-md border border-white/10 
                            ${tag.color === 'blue' ? 'bg-blue-500/20 text-blue-300' :
                                tag.color === 'purple' ? 'bg-purple-500/20 text-purple-300' :
                                    tag.color === 'orange' ? 'bg-orange-500/20 text-orange-300' :
                                        'bg-green-500/20 text-green-300'}`}>
                            {tag.label}
                        </span>
                    ))}
                </div>

                {/* Bottom: Info */}
                <div>
                    <div className="flex justify-between items-end">
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-1 capitalize">{dayLabel}</h3>
                            <p className="text-gray-300 font-medium text-sm flex items-center gap-2">
                                <span className="text-white font-bold">{timeLabel}</span>
                                <span className="w-1 h-1 rounded-full bg-gray-500"></span>
                                {booking.club.name}
                            </p>
                        </div>
                        <div className="text-right flex items-center gap-2">
                            {/* Cancel Button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowConfirm(true);
                                }}
                                className="w-10 h-10 rounded-full bg-red-500/20 backdrop-blur-md border border-red-500/30 flex items-center justify-center hover:bg-red-500 hover:border-red-400 transition-colors group/cancel"
                                title="Annuleer boeking"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-red-400 group-hover/cancel:text-white">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                            </button>

                            {/* View Details Arrow */}
                            <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-500 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-white">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowConfirm(false)}>
                    <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-white mb-2">Boeking annuleren?</h3>
                        <p className="text-gray-400 text-sm mb-6">
                            Weet je zeker dat je deze boeking wilt annuleren? Deze actie kan niet ongedaan worden gemaakt.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="flex-1 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-colors"
                                disabled={isCancelling}
                            >
                                Terug
                            </button>
                            <button
                                onClick={handleCancel}
                                disabled={isCancelling}
                                className="flex-1 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isCancelling ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                        Bezig...
                                    </>
                                ) : (
                                    'Annuleren'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
