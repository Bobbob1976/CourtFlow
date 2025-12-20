"use client";

import { format } from "date-fns";
import { nl } from "date-fns/locale";
import Link from "next/link";

interface BookingCardProps {
    booking: {
        id: string;
        booking_date: string;
        start_time: string;
        end_time: string;
        total_price: number;
        status: string;
        court: {
            name: string;
            sport: string;
        };
        club: {
            id: string;
            name: string;
            subdomain: string;
        };
        matches?: any[];
    };
}

import ScoreSubmissionModal from "@/components/match/ScoreSubmissionModal";
import { useState } from "react";
import { shareMatch } from "@/utils/share";

export default function BookingCard({ booking }: BookingCardProps) {
    const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
    const date = new Date(booking.booking_date);
    const isPast = new Date(`${booking.booking_date}T${booking.end_time}`) < new Date();

    return (
        <>
            <div className={`bg-white/5 rounded-2xl p-6 border transition-all ${isPast ? "border-white/5 opacity-80" : "border-white/10 hover:border-white/20 hover:bg-white/10"}`}>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="font-bold text-lg text-white">{booking.club.name}</h3>
                        <p className="text-gray-400 text-sm">{booking.court.name} • {booking.court.sport}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${booking.status === 'confirmed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                        booking.status === 'cancelled' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                            'bg-gray-700 text-gray-300'
                        }`}>
                        {booking.status === 'confirmed' ? 'Bevestigd' :
                            booking.status === 'cancelled' ? 'Geannuleerd' : booking.status}
                    </div>
                </div>

                <div className="flex items-center gap-4 mb-4">
                    {/* Facepile & Score Section */}
                    {isPast && booking.match_result && booking.match_result.length > 0 ? (
                        <div className="flex-1 flex items-center justify-between bg-[#121212]/50 rounded-xl p-3 border border-white/5">
                            {/* Facepile */}
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-[#1a1a1a] bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-[10px] font-bold text-white shadow-md">
                                        {i === 1 ? 'ME' : String.fromCharCode(64 + i)}
                                    </div>
                                ))}
                            </div>

                            {/* Score */}
                            <div className="text-right">
                                <div className="text-xs font-bold text-gray-500 uppercase">Uitslag</div>
                                <div className={`font-mono font-bold ${booking.match_result[0].winner_team === 'team1' ? 'text-green-400' : 'text-red-400'}`}>
                                    {booking.match_result[0].team1_score} - {booking.match_result[0].team2_score}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-500 uppercase font-bold">Datum</span>
                                <span className="font-medium text-gray-200">
                                    {format(date, "EEE d MMM", { locale: nl })}
                                </span>
                            </div>
                            <div className="w-px h-8 bg-white/10"></div>
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-500 uppercase font-bold">Tijd</span>
                                <span className="font-medium text-gray-200">
                                    {booking.start_time.slice(0, 5)} - {booking.end_time.slice(0, 5)}
                                </span>
                            </div>
                            <div className="w-px h-8 bg-white/10"></div>
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-500 uppercase font-bold">Prijs</span>
                                <span className="font-medium text-gray-200">€{booking.total_price}</span>
                            </div>
                        </>
                    )}
                </div>

                <div className="flex justify-end gap-3 items-center">
                    {!isPast && booking.status === 'confirmed' && (
                        <button
                            onClick={() => shareMatch({
                                id: booking.id,
                                clubName: booking.club.name,
                                date: format(date, "d MMM", { locale: nl }) + " " + booking.start_time.slice(0, 5)
                            })}
                            className="text-sm font-bold text-green-400 bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-lg hover:bg-green-500/20 transition-all flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="18" cy="5" r="3"></circle>
                                <circle cx="6" cy="12" r="3"></circle>
                                <circle cx="18" cy="19" r="3"></circle>
                                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                            </svg>
                            Nodig uit
                        </button>
                    )}

                    {isPast && booking.status === 'confirmed' && (
                        <button
                            onClick={() => setIsScoreModalOpen(true)}
                            className="text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-blue-500/20 transition-all"
                        >
                            Uitslag Invoeren ✨
                        </button>
                    )}

                    <Link
                        href={`/${booking.club.subdomain || booking.club.id}`}
                        className="text-sm text-blue-400 font-medium hover:text-blue-300 transition-colors"
                    >
                        Nieuwe boeking maken &rarr;
                    </Link>
                </div>
            </div>

            <ScoreSubmissionModal
                isOpen={isScoreModalOpen}
                onClose={() => setIsScoreModalOpen(false)}
                booking={booking}
            />
        </>
    );
}
