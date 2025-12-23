"use client";

import { useState, useEffect } from "react";
import { Clock, Users, Wrench, AlertCircle, Play, Pause, X, Calendar, Mail, Phone, CreditCard, CheckCircle } from "lucide-react";

interface Court {
    id: string;
    name: string;
    status: "available" | "occupied" | "maintenance" | "payment_pending";
    currentBooking?: {
        id: string;
        startTime: string;
        endTime: string;
        remainingMinutes: number;
        players: {
            name: string;
            avatar?: string;
            email?: string;
            location?: string;
        }[];
        paymentStatus: string;
    } | null;
    nextBooking?: {
        id: string;
        startTime: string;
        player: string;
        email?: string;
        avatar?: string;
    } | null;
    maintenanceInfo?: {
        reason: string;
        estimatedEnd: string;
    };
}

import { cancelBooking, moveBooking } from "@/app/actions/admin-actions";
import { blockCourtForMaintenance } from "@/app/actions/maintenance-actions";
import { markBookingAsPaid } from "@/app/actions/finance-actions";

export default function VisualCourtGrid({ clubId }: { clubId: string }) {
    const [courts, setCourts] = useState<Court[]>([]);
    const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [viewingDetails, setViewingDetails] = useState<any>(null);

    useEffect(() => {
        fetchCourtStatus();
        const interval = setInterval(fetchCourtStatus, 30000); // Update every 30s
        return () => clearInterval(interval);
    }, [clubId]);

    async function fetchCourtStatus() {
        try {
            setError(null);
            const response = await fetch(`/api/admin/courts/status?clubId=${clubId}`);

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || `Server error: ${response.status}`);
            }

            const data = await response.json();
            if (data && Array.isArray(data.courts)) {
                setCourts(data.courts);
            } else {
                console.error("Invalid court data format", data);
                setError("Ongeldig data formaat ontvangen van server.");
                setCourts([]);
            }
        } catch (error: any) {
            console.error("Failed to fetch court status:", error);
            setError(error.message || "Kon baan data niet ophalen.");
        } finally {
            setLoading(false);
        }
    }

    const handleCancel = async (bookingId: string) => {
        if (!confirm("Weet je zeker dat je deze boeking wilt annuleren?")) return;

        setProcessing(true);
        try {
            await cancelBooking(bookingId);
            alert("Boeking geannuleerd.");
            setSelectedCourt(null); // Close modal
            fetchCourtStatus(); // Refresh grid
        } catch (err) {
            alert("Fout bij annuleren.");
            console.error(err);
        } finally {
            setProcessing(false);
        }
    };

    const handleMove = async (bookingId: string) => {
        const newTime = prompt("Naar welke tijd wil je verplaatsen? (HH:mm)", "18:00");
        if (!newTime) return;

        // Voor MVP nemen we aan: verplaatsen binnen VANDAAG
        const today = new Date().toISOString().split('T')[0];

        setProcessing(true);
        try {
            await moveBooking(bookingId, newTime, today);
            alert(`Succesvol verplaatst naar ${newTime}`);
            setSelectedCourt(null);
            fetchCourtStatus();
        } catch (err: any) {
            alert(err.message || "Fout bij verplaatsen.");
        } finally {
            setProcessing(false);
        }
    };

    const handleBlock = async (courtId: string) => {
        const reason = prompt("Reden voor onderhoud:", "Baanonderhoud");
        if (!reason) return;

        const durationStr = prompt("Hoe lang? (in uren, bijv: 1, 2, 24)", "1");
        if (!durationStr) return;

        const duration = parseFloat(durationStr);
        if (isNaN(duration)) return;

        setProcessing(true);
        try {
            // Calculate start/end times (simple MVP: starts NOW)
            const now = new Date();
            // Round up to next 30 min for display niceness? No, keep it simple.
            const startH = now.getHours().toString().padStart(2, '0');
            const startM = now.getMinutes().toString().padStart(2, '0');
            const startTime = `${startH}:${startM}`;

            const end = new Date(now.getTime() + duration * 60 * 60 * 1000);

            let endTime = "";
            // If end date is different from start date, cap at 23:59
            if (end.getDate() !== now.getDate()) {
                endTime = "23:59";
            } else {
                const endH = end.getHours().toString().padStart(2, '0');
                const endM = end.getMinutes().toString().padStart(2, '0');
                endTime = `${endH}:${endM}`;
            }

            // Format Date YYYY-MM-DD
            const dateStr = now.toISOString().split('T')[0];

            await blockCourtForMaintenance(courtId, dateStr, startTime, endTime, reason);
            alert("Baan geblokkeerd! 🚧");
            fetchCourtStatus();
        } catch (err: any) {
            alert("Fout bij blokkeren: " + err.message);
        } finally {
            setProcessing(false);
        }
    };

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

    if (error) {
        return (
            <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-2xl text-center">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Er ging iets mis</h3>
                <p className="text-red-300 mb-4">{error}</p>
                <button
                    onClick={() => fetchCourtStatus()}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold transition-colors"
                >
                    Opnieuw Proberen
                </button>
            </div>
        );
    }

    if (courts.length === 0) {
        return (
            <div className="p-12 text-center bg-white/5 rounded-3xl border border-white/10 border-dashed">
                <Wrench className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-400">Geen banen gevonden</h3>
                <p className="text-gray-500 text-sm mt-2">
                    Er zijn geen banen gekoppeld aan Club ID: <span className="font-mono text-gray-400">{clubId}</span>.
                    <br />Controleer je database of maak nieuwe banen aan.
                </p>
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
                                    <div className="flex items-center gap-2 text-sm mt-2">
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
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                                    <span className="font-bold uppercase text-xs text-emerald-400 tracking-wider">Beschikbaar</span>
                                </div>
                                {court.nextBooking && (
                                    <div className="text-xs text-blue-300 font-medium flex items-center gap-1 mt-1">
                                        <span>🕒</span>
                                        Volgende: {court.nextBooking.startTime} ({court.nextBooking.player})
                                    </div>
                                )}
                                <button className="w-full bg-green-500/20 hover:bg-green-500/30 text-green-400 py-2 px-3 rounded-xl text-sm font-bold transition-colors border border-green-500/30">
                                    + Snel Boeken
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleBlock(court.id); }}
                                    className="w-full bg-gray-700/50 hover:bg-gray-700 text-gray-400 py-2 px-3 rounded-xl text-xs font-bold transition-colors border border-gray-600/30 flex items-center justify-center gap-2"
                                >
                                    <Wrench className="w-3 h-3" />
                                    Onderhoud
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
            </div >

            {/* Quick Action Modal */}
            {
                selectedCourt && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-gray-900 border border-white/20 rounded-3xl p-6 max-w-md w-full relative shadow-2xl">
                            <button
                                onClick={() => setSelectedCourt(null)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-white mb-1">{selectedCourt.name}</h2>
                                <p className="text-gray-400 text-sm">Beheer huidige status</p>
                            </div>

                            <div className="space-y-3">
                                {selectedCourt.status === 'occupied' || selectedCourt.status === 'payment_pending' ? (
                                    <div className="grid grid-cols-1 gap-3">
                                        <button
                                            onClick={() => selectedCourt.currentBooking && handleMove(selectedCourt.currentBooking.id)}
                                            disabled={processing}
                                            className="w-full bg-[#1e293b] hover:bg-[#334155] text-blue-400 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors border border-blue-500/20 disabled:opacity-50"
                                        >
                                            <Calendar className="w-5 h-5" />
                                            {processing ? 'Bezig...' : 'Verplaatsen'}
                                        </button>

                                        <button
                                            onClick={() => selectedCourt.currentBooking && handleCancel(selectedCourt.currentBooking.id)}
                                            disabled={processing}
                                            className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors border border-red-500/20 disabled:opacity-50"
                                        >
                                            <X className="w-5 h-5" />
                                            {processing ? 'Bezig...' : 'Boeking Annuleren'}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <button
                                            onClick={() => window.open(`/${clubId}`, '_blank')}
                                            className="w-full bg-[#C4FF0D] hover:bg-[#b0e60b] text-black py-3 px-4 rounded-xl font-bold transition-colors"
                                        >
                                            + Nieuwe Boeking Maken
                                        </button>

                                        {selectedCourt.nextBooking && (
                                            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                                <p className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                                                    <span>🔜</span>
                                                    Aankomend: <span className="text-white font-bold">{selectedCourt.nextBooking.startTime}</span>
                                                </p>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <button
                                                        onClick={() => selectedCourt.nextBooking && handleMove(selectedCourt.nextBooking.id)}
                                                        className="bg-[#1e293b] text-blue-400 py-2 rounded-lg text-xs font-bold border border-blue-500/20 hover:bg-[#334155] flex items-center justify-center gap-1"
                                                    >
                                                        <Calendar className="w-3 h-3" /> Verplaatsen
                                                    </button>
                                                    <button
                                                        onClick={() => selectedCourt.nextBooking && handleCancel(selectedCourt.nextBooking.id)}
                                                        className="bg-red-500/10 text-red-400 py-2 rounded-lg text-xs font-bold border border-red-500/20 hover:bg-red-500/20 flex items-center justify-center gap-1"
                                                    >
                                                        <X className="w-3 h-3" /> Annuleren
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {(selectedCourt.currentBooking || selectedCourt.nextBooking) && (
                                    <div className="mt-6 pt-6 border-t border-white/10 text-center">
                                        <button className="text-gray-500 text-sm hover:text-white transition-colors"
                                            onClick={() => {
                                                const booking = selectedCourt.currentBooking || selectedCourt.nextBooking;
                                                if (!booking) return;

                                                const isCurrent = !!selectedCourt.currentBooking;
                                                // Helper to safely get player data
                                                const player = isCurrent
                                                    ? selectedCourt.currentBooking!.players[0]
                                                    : {
                                                        name: selectedCourt.nextBooking!.player,
                                                        email: selectedCourt.nextBooking!.email,
                                                        avatar: selectedCourt.nextBooking!.avatar
                                                    };

                                                setViewingDetails({
                                                    avatar: player.avatar,
                                                    name: player.name,
                                                    email: player.email,
                                                    location: (player as any).location,
                                                    type: isCurrent ? "Huidige Boeking" : "Volgende Boeking",
                                                    time: isCurrent
                                                        ? `${selectedCourt.currentBooking!.startTime} - ${selectedCourt.currentBooking!.endTime}`
                                                        : `${selectedCourt.nextBooking!.startTime}`,
                                                    paymentStatus: isCurrent ? selectedCourt.currentBooking!.paymentStatus : 'unknown',
                                                    id: booking.id
                                                });
                                            }}
                                        >
                                            Bekijk Baan Details
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }
            {/* Detail Modal */}
            {
                viewingDetails && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-6 max-w-sm w-full relative shadow-2xl animate-in fade-in zoom-in duration-200">
                            <button
                                onClick={() => setViewingDetails(null)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-white bg-white/5 p-2 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex flex-col items-center mb-6 pt-2">
                                <div className="w-24 h-24 rounded-full border-4 border-[#C4FF0D] overflow-hidden shadow-[0_0_20px_rgba(196,255,13,0.2)] mb-4">
                                    {viewingDetails.avatar ? (
                                        <img src={viewingDetails.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-3xl font-bold text-white">
                                            {(viewingDetails.name?.[0] || 'G').toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <h3 className="text-xl font-bold text-white">{viewingDetails.name}</h3>
                                {viewingDetails.location && <p className="text-sm text-gray-400 flex items-center gap-1">📍 {viewingDetails.location}</p>}
                            </div>

                            <div className="space-y-3 bg-white/5 rounded-2xl p-4 border border-white/5">
                                {viewingDetails.email && (
                                    <div className="flex items-center gap-3 text-sm text-gray-300">
                                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                                            <Mail className="w-4 h-4" />
                                        </div>
                                        <span className="truncate">{viewingDetails.email}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-3 text-sm text-gray-300">
                                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <span>{viewingDetails.type} • <span className="text-white font-bold">{viewingDetails.time}</span></span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-300">
                                    <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-400">
                                        <CreditCard className="w-4 h-4" />
                                    </div>
                                    <span className={viewingDetails.paymentStatus === 'pending' ? 'text-yellow-400 font-bold' : 'text-gray-300'}>
                                        {viewingDetails.paymentStatus === 'paid' ? 'Betaald ✅' :
                                            viewingDetails.paymentStatus === 'pending' ? 'Openstaand ⚠️' : 'Onbekend'}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-6">
                                {viewingDetails.email && (
                                    <a href={`mailto:${viewingDetails.email}`} className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl text-sm font-bold transition-colors border border-white/10">
                                        <Mail className="w-4 h-4" /> Email
                                    </a>
                                )}
                                <button className="flex items-center justify-center gap-2 bg-[#C4FF0D] hover:bg-[#b0e60b] text-black py-3 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-[#C4FF0D]/20">
                                    <Phone className="w-4 h-4" /> Bel
                                </button>
                                {viewingDetails.paymentStatus !== 'paid' && (
                                    <button
                                        onClick={async () => {
                                            if (!confirm("Boeking markeren als betaald?")) return;
                                            try {
                                                await markBookingAsPaid(viewingDetails.id);
                                                setViewingDetails((prev: any) => ({ ...prev, paymentStatus: 'paid' }));
                                                fetchCourtStatus();
                                            } catch (e) { alert("Fout bij updaten"); }
                                        }}
                                        className="col-span-2 flex items-center justify-center gap-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 py-3 rounded-xl text-sm font-bold transition-colors border border-green-500/20"
                                    >
                                        <CheckCircle className="w-4 h-4" /> Markeer als Betaald
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    );
}
