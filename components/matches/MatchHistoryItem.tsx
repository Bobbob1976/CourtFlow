"use client";

import { format } from "date-fns";
import { nl } from "date-fns/locale";
import Facepile from "../social/Facepile";

interface MatchHistoryItemProps {
    match: {
        id: string;
        date: string;
        court_name: string;
        club_name: string;
        score?: string;
        result?: 'won' | 'lost' | 'draw';
        players: Array<{
            id: string;
            name: string;
            avatar_url?: string;
        }>;
    };
}

export default function MatchHistoryItem({ match }: MatchHistoryItemProps) {
    const matchDate = new Date(match.date);
    const formattedDate = format(matchDate, 'd MMM yyyy', { locale: nl });
    const formattedTime = format(matchDate, 'HH:mm');

    const resultColors = {
        won: 'text-green-400 bg-green-500/10 border-green-500/20',
        lost: 'text-red-400 bg-red-500/10 border-red-500/20',
        draw: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    };

    const resultIcons = {
        won: '🏆',
        lost: '😔',
        draw: '🤝',
    };

    return (
        <div className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-5 hover:bg-white/10 hover:border-white/20 transition-all duration-300 shadow-lg hover:shadow-xl">
            {/* Decorative Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>

            <div className="relative flex items-center justify-between">
                {/* Left: Match Info */}
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-bold text-white">{match.court_name}</h3>
                        {match.result && (
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${resultColors[match.result]} flex items-center gap-1`}>
                                <span>{resultIcons[match.result]}</span>
                                {match.result === 'won' ? 'Gewonnen' : match.result === 'lost' ? 'Verloren' : 'Gelijkspel'}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                            </svg>
                            <span className="font-medium">{formattedDate}</span>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-gray-600"></div>
                        <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                            <span className="font-medium">{formattedTime}</span>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-gray-600"></div>
                        <span>{match.club_name}</span>
                    </div>

                    {/* Score */}
                    {match.score && (
                        <div className="mt-3">
                            <span className={`text-2xl font-black ${match.result === 'won' ? 'text-green-400' : match.result === 'lost' ? 'text-red-400' : 'text-yellow-400'}`}>
                                {match.score}
                            </span>
                        </div>
                    )}
                </div>

                {/* Right: Players Facepile */}
                <div className="flex flex-col items-end gap-2">
                    <Facepile players={match.players} maxVisible={4} />
                    <span className="text-xs text-gray-500 font-medium">
                        {match.players.length} {match.players.length === 1 ? 'speler' : 'spelers'}
                    </span>
                </div>
            </div>

            {/* Hover Arrow */}
            <div className="absolute right-5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-blue-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
            </div>
        </div>
    );
}
