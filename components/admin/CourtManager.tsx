"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function CourtManager({ court }: { court: any }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const isActive = court.status === 'active';
    const isMaintenance = court.status === 'maintenance';

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

    return (
        <>
            <div className={`relative overflow-hidden rounded-2xl border p-6 transition-all group ${isActive ? 'bg-green-900/10 border-green-500/30 shadow-[0_0_20px_rgba(74,222,128,0.1)]' :
                    isMaintenance ? 'bg-red-900/10 border-red-500/30' :
                        'bg-white/5 border-white/5 hover:bg-white/10'
                }`}>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="font-bold text-white text-lg">{court.name}</h3>
                        <p className="text-xs text-gray-500">{court.sport} • {court.club?.name}</p>
                    </div>
                    <span className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500 animate-pulse shadow-[0_0_10px_#4ade80]' :
                            isMaintenance ? 'bg-red-500' :
                                'bg-gray-600'
                        }`}></span>
                </div>

                {isActive ? (
                    <div className="space-y-4">
                        <div className="p-3 rounded-xl bg-[#121212]/50 border border-white/5">
                            <p className="text-xs text-gray-400 uppercase font-bold mb-1">Current Players</p>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                                    {court.currentBooking.user?.full_name?.[0] || '?'}
                                </div>
                                <span className="text-sm font-bold text-white">
                                    {court.currentBooking.user?.full_name || 'Unknown Player'}
                                </span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-400">Ends at</span>
                            <span className="font-mono font-bold text-green-400">
                                {court.currentBooking.end_time.slice(0, 5)}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="h-24 flex flex-col items-center justify-center text-gray-600 gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-medium">Available</span>
                    </div>
                )}

                {/* Quick Actions Overlay */}
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => setIsOpen(true)}
                        className="bg-white text-black px-4 py-2 rounded-lg font-bold text-sm hover:scale-105 transition-transform"
                    >
                        Manage Court
                    </button>
                </div>
            </div>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#1a1a1a] w-full max-w-sm rounded-2xl p-6 border border-white/10">
                        <h3 className="text-xl font-bold text-white mb-4">Manage {court.name}</h3>
                        <div className="space-y-3">
                            <button
                                onClick={toggleMaintenance}
                                disabled={isLoading}
                                className="w-full py-3 rounded-xl font-bold text-white bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 transition-colors"
                            >
                                {isMaintenance ? "Disable Maintenance Mode" : "Enable Maintenance Mode"}
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-full py-3 rounded-xl font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
