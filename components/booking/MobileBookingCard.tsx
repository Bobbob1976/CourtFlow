"use client";

import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { Clock, MapPin, Users, CreditCard } from "lucide-react";

interface MobileBookingCardProps {
    booking: {
        id: string;
        booking_date: string;
        start_time: string;
        end_time: string;
        total_cost: number;
        payment_status: string;
        court?: { name: string; sport: string };
        attendees: number;
    };
    onCancel?: (id: string) => void;
    onExtend?: (id: string) => void;
}

export default function MobileBookingCard({ booking, onCancel, onExtend }: MobileBookingCardProps) {
    const date = new Date(booking.booking_date);
    const isPaid = booking.payment_status === "paid";

    return (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 rounded-2xl p-4 shadow-xl">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div>
                    <h3 className="text-lg font-bold text-white">{booking.court?.name}</h3>
                    <p className="text-sm text-gray-400">{booking.court?.sport}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${isPaid
                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                    }`}>
                    {isPaid ? "✓ Paid" : "Pending"}
                </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <Clock className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs">Time</p>
                        <p className="text-white font-bold">
                            {booking.start_time.slice(0, 5)} - {booking.end_time.slice(0, 5)}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <Users className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs">Players</p>
                        <p className="text-white font-bold">{booking.attendees}</p>
                    </div>
                </div>
            </div>

            {/* Date Banner */}
            <div className="bg-white/5 rounded-xl p-3 mb-4 border border-white/5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-white font-medium">
                            {format(date, "EEEE d MMMM", { locale: nl })}
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <CreditCard className="w-4 h-4 text-green-400" />
                        <span className="text-xl font-bold text-green-400">€{booking.total_cost}</span>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                {onExtend && (
                    <button
                        onClick={() => onExtend(booking.id)}
                        className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold text-sm transition-all active:scale-95"
                    >
                        Extend
                    </button>
                )}
                {onCancel && (
                    <button
                        onClick={() => onCancel(booking.id)}
                        className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl font-bold text-sm transition-all border border-white/10 active:scale-95"
                    >
                        Cancel
                    </button>
                )}
                <button className="px-4 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all border border-white/10 active:scale-95">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
