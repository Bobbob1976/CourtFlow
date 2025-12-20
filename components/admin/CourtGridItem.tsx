"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

interface CourtGridProps {
    court: any;
}

export default function CourtGridItem({ court }: CourtGridProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState<string>("");
    const router = useRouter();
    const supabase = createClient();

    const isActive = court.status === 'active';
    const isMaintenance = court.status === 'maintenance';
    const isEmpty = court.status === 'empty';
    const isUnpaid = court.currentBooking?.payment_status === 'pending';

    // Countdown timer for active courts
    useEffect(() => {
        if (!isActive || !court.currentBooking?.end_time) return;

        const updateTimer = () => {
            const now = new Date();
            const [hours, minutes] = court.currentBooking.end_time.split(':');
            const endTime = new Date();
            endTime.setHours(parseInt(hours), parseInt(minutes), 0);

            const diff = endTime.getTime() - now.getTime();
            if (diff <= 0) {
                setTimeRemaining("00:00");
                router.refresh();
                return;
            }

            const mins = Math.floor(diff / 60000);
            const secs = Math.floor((diff % 60000) / 1000);
            setTimeRemaining(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [isActive, court.currentBooking, router]);

    async function toggleMaintenance() {
        setIsLoading(true);
        const newStatus = isMaintenance ? 'active' : 'maintenance';

        const { error } = await supabase
            .from('courts')
            .update({ status: newStatus })
            .eq('id', court.id);

        if (error) {
            console.error("Error updating court status:", error);
            alert("Failed to update court status");
        } else {
            setIsOpen(false);
            router.refresh();
        }
        setIsLoading(false);
    }

    // Determine visual state
    let bgColor = 'bg-white/5';
    let borderColor = 'border-white/10';
    let glowColor = '';
    let statusIcon = null;
    let statusLabel = 'Available';

    if (isMaintenance) {
        bgColor = 'bg-red-900/20';
        borderColor = 'border-red-500/30';
        glowColor = 'shadow-[0_0_20px_rgba(239,68,68,0.2)]';
        statusIcon = '🔧';
        statusLabel = 'Maintenance';
    } else if (isUnpaid) {
        bgColor = 'bg-orange-900/20';
        borderColor = 'border-orange-500/30';
        glowColor = 'shadow-[0_0_20px_rgba(249,115,22,0.2)]';
        statusIcon = '⚠️';
        statusLabel = 'Unpaid';
    } else if (isActive) {
        bgColor = 'bg-green-900/20';
        borderColor = 'border-green-500/30';
        glowColor = 'shadow-[0_0_20px_rgba(74,222,128,0.2)]';
        statusIcon = '🎾';
        statusLabel = 'Active';
    } else {
        statusIcon = '✓';
        statusLabel = 'Available';
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className={`relative overflow-hidden rounded-2xl border-2 p-6 transition-all duration-300 hover:scale-105 cursor-pointer group ${bgColor} ${borderColor} ${glowColor} hover:shadow-2xl`}
            >
                {/* Court Number Badge */}
                <div className="absolute top-3 left-3 w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <span className="text-lg font-black text-white">{court.name.match(/\d+/)?.[0] || '?'}</span>
                </div>

                {/* Status Indicator */}
                <div className="absolute top-3 right-3">
                    <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500 animate-pulse shadow-[0_0_10px_#4ade80]' :
                        isMaintenance ? 'bg-red-500' :
                            isUnpaid ? 'bg-orange-500 animate-pulse' :
                                'bg-gray-600'
                        }`}></div>
                </div>

                {/* Main Content */}
                <div className="mt-12 space-y-4">
                    {/* Status Icon & Label */}
                    <div className="text-center">
                        <div className="text-4xl mb-2">{statusIcon}</div>
                        <p className={`text-xs font-bold uppercase tracking-wider ${isActive ? 'text-green-400' :
                            isMaintenance ? 'text-red-400' :
                                isUnpaid ? 'text-orange-400' :
                                    'text-gray-400'
                            }`}>
                            {statusLabel}
                        </p>
                    </div>

                    {/* Active Court Info */}
                    {isActive && court.currentBooking && (
                        <div className="space-y-3">
                            {/* Players Avatars */}
                            <div className="flex justify-center -space-x-2">
                                {['Player 1', 'Player 2', 'Player 3', 'Player 4'].slice(0, court.max_players || 4).map((player, i) => (
                                    <div
                                        key={i}
                                        className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 border-2 border-slate-950 flex items-center justify-center text-xs font-bold text-white"
                                        title={player}
                                    >
                                        {court.currentBooking.user?.full_name?.[0] || '?'}
                                    </div>
                                ))}
                            </div>

                            {/* Countdown Timer */}
                            <div className="text-center">
                                <p className="text-xs text-gray-400 mb-1">Time Remaining</p>
                                <p className="text-2xl font-mono font-black text-green-400 tabular-nums">
                                    {timeRemaining}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Empty Court - Quick Book */}
                    {isEmpty && (
                        <div className="flex justify-center">
                            <div className="w-12 h-12 rounded-full bg-white/10 border-2 border-dashed border-white/20 flex items-center justify-center group-hover:bg-blue-500/20 group-hover:border-blue-500/50 transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 text-gray-400 group-hover:text-blue-400">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                            </div>
                        </div>
                    )}

                    {/* Maintenance Icon */}
                    {isMaintenance && (
                        <div className="flex justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-red-400/50">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
                            </svg>
                        </div>
                    )}
                </div>

                {/* Court Info Footer */}
                <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-xs text-gray-500 text-center font-medium">
                        {court.sport} • {court.club?.name || 'Club'}
                    </p>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-300 pointer-events-none"></div>
            </button>

            {/* Modal for Actions */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsOpen(false)}>
                    <div className="bg-slate-950 border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-2xl font-bold text-white mb-2">{court.name}</h3>
                        <p className="text-sm text-gray-400 mb-6">{court.sport} • {court.club?.name}</p>

                        <div className="space-y-3">
                            {isEmpty && (
                                <>
                                    <button className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors flex items-center justify-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                        </svg>
                                        Quick Book
                                    </button>

                                    <button className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-colors flex items-center justify-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
                                        </svg>
                                        Maak Les-Boeking
                                    </button>
                                </>
                            )}

                            <button
                                onClick={toggleMaintenance}
                                disabled={isLoading}
                                className={`w-full py-3 px-4 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 ${isMaintenance
                                    ? 'bg-green-600 hover:bg-green-500 text-white'
                                    : 'bg-red-600 hover:bg-red-500 text-white'
                                    }`}
                            >
                                {isLoading ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
                                        </svg>
                                        {isMaintenance ? 'Mark as Available' : 'Mark for Maintenance'}
                                    </>
                                )}
                            </button>

                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white font-bold transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
