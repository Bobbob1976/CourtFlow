"use client";

import { useState, useEffect } from "react";
import { Clock, Users, Wrench, AlertCircle, Play, Pause, X } from "lucide-react";

interface Court {
    id: string;
    name: string;
    status: "available" | "occupied" | "maintenance" | "payment_pending";
    currentBooking?: {
        id: string;
        startTime: string;
        endTime: string;
        remainingMinutes: number;
        players: { name: string; avatar?: string }[];
        paymentStatus: string;
    };
    maintenanceInfo?: {
        reason: string;
        estimatedEnd: string;
    };
}

export default function VisualCourtGrid({ clubId }: { clubId: string }) {
    const [courts, setCourts] = useState<Court[]>([]);
    const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCourtStatus();
        const interval = setInterval(fetchCourtStatus, 30000); // Update every 30s
        return () => clearInterval(interval);
    }, [clubId]);

    async function fetchCourtStatus() {
        try {
            const response = await fetch(`/api/admin/courts/status?clubId=${clubId}`);
            const data = await response.json();
            if (data && Array.isArray(data.courts)) {
                setCourts(data.courts);
            } else {
                console.error("Invalid court data format", data);
                setCourts([]);
            }
        } catch (error) {
            console.error("Failed to fetch court status:", error);
        } finally {
            setLoading(false);
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "available":
                return "bg-green-500/20 border-green-500/50 hover:bg-green-500/30";
            case "occupied":
                return "bg-blue-500/20 border-blue-500/50 hover:bg-blue-500/30";
            case "maintenance":
                return "bg-red-500/20 border-red-500/50 hover:bg-red-500/30";
            case "payment_pending":
                return "bg-yellow-500/20 border-yellow-500/50 hover:bg-yellow-500/30 animate-pulse";
            default:
                return "bg-gray-500/20 border-gray-500/50";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "available":
                return <Play className="w-5 h-5 text-green-400" />;
            case "occupied":
                return <Pause className="w-5 h-5 text-blue-400" />;
            case "maintenance":
                return <Wrench className="w-5 h-5 text-red-400" />;
            case "payment_pending":
                return <AlertCircle className="w-5 h-5 text-yellow-400" />;
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-48 bg-white/5 rounded-2xl animate-pulse border border-white/10"></div>
                ))}
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {courts.map((court) => (
                    <div
                        key={court.id}
                        onClick={() => setSelectedCourt(court)}
                        className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${getStatusColor(court.status)} group`}
                    >
                        {/* Court Header */}
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-bold text-white text-lg">{court.name}</h3>
                            {getStatusIcon(court.status)}
                        </div>

                        {/* Status Content */}
                        {court.status === "occupied" && court.currentBooking && (
                            <div className="space-y-2">
                                {/* Countdown Timer */}
                                <div className="bg-white/10 rounded-xl p-2 border border-white/20">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Clock className="w-4 h-4 text-blue-400" />
                                        <span className="text-white font-bold">
                                            {court.currentBooking.remainingMinutes} min
                                        </span>
                                        <span className="text-gray-400 text-xs">resterend</span>
                                    </div>
                                </div>

                                {/* Players */}
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-gray-400" />
                                    <div className="flex -space-x-2">
                                        {court.currentBooking.players.slice(0, 4).map((player, idx) => (
                                            <div
                                                key={idx}
                                                className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 border-2 border-gray-900 flex items-center justify-center text-xs font-bold text-white"
                                                title={player.name}
                                            >
                                                {player.name.charAt(0).toUpperCase()}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Time Range */}
                                <p className="text-xs text-gray-400">
                                    {court.currentBooking.startTime} - {court.currentBooking.endTime}
                                </p>
                            </div>
                        )}

                        {court.status === "available" && (
                            <div className="space-y-2">
                                <p className="text-sm text-green-400 font-bold">Beschikbaar</p>
                                <button className="w-full bg-green-500/20 hover:bg-green-500/30 text-green-400 py-2 px-3 rounded-xl text-sm font-bold transition-colors border border-green-500/30">
                                    + Snel Boeken
                                </button>
                            </div>
                        )}

                        {court.status === "maintenance" && court.maintenanceInfo && (
                            <div className="space-y-2">
                                <p className="text-sm text-red-400 font-bold">Onderhoud</p>
                                <p className="text-xs text-gray-400">{court.maintenanceInfo.reason}</p>
                                <p className="text-xs text-gray-500">
                                    Tot: {court.maintenanceInfo.estimatedEnd}
                                </p>
                            </div>
                        )}

                        {court.status === "payment_pending" && (
                            <div className="space-y-2">
                                <p className="text-sm text-yellow-400 font-bold">⚠️ Betaling Openstaand</p>
                                <button className="w-full bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 py-2 px-3 rounded-xl text-sm font-bold transition-colors border border-yellow-500/30">
                                    Herinnering Sturen
                                </button>
                            </div>
                        )}

                        {/* Hover Effect */}
                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none"></div>
                    </div>
                ))}
            </div>

            {/* Quick Action Modal */}
            {selectedCourt && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-gray-900 border border-white/20 rounded-3xl p-6 max-w-md w-full relative">
                        <button
                            onClick={() => setSelectedCourt(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <h2 className="text-2xl font-bold text-white mb-4">{selectedCourt.name}</h2>

                        <div className="space-y-3">
                            <button className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 px-4 rounded-xl font-bold transition-colors">
                                Verlengen (+30 min)
                            </button>
                            <button className="w-full bg-purple-600 hover:bg-purple-500 text-white py-3 px-4 rounded-xl font-bold transition-colors">
                                Verplaatsen
                            </button>
                            <button className="w-full bg-red-600 hover:bg-red-500 text-white py-3 px-4 rounded-xl font-bold transition-colors">
                                Annuleren
                            </button>
                            <button className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-xl font-bold transition-colors">
                                Details Bekijken
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
