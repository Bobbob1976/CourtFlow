"use client";

import { useState } from "react";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { createAtomicBooking } from "@/app/(club)/[clubId]/actions";

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedDate: Date;
    courtId: string;
    clubId: string;
    userId: string;
    price: number;
}

export default function BookingModal({
    isOpen,
    onClose,
    selectedDate,
    courtId,
    clubId,
    userId,
    price,
}: BookingModalProps) {
    const [mode, setMode] = useState<"private" | "match">("private");
    const [splitPayment, setSplitPayment] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (formData: FormData) => {
        console.log("Submitting booking form...");
        setIsSubmitting(true);
        // Add extra fields for the new logic
        if (mode === "match") {
            formData.append("isPublicMatch", "true");
            formData.append("lookingForPlayers", "3"); // Default
        }
        if (splitPayment) {
            formData.append("splitPayment", "true");
        }

        try {
            await createAtomicBooking(formData);
            console.log("Booking action completed (should have redirected)");
        } catch (e) {
            console.error("Booking submission error:", e);
        } finally {
            // Only reset if we didn't redirect (which means error or weird state)
            // But since redirect throws, we might land here? 
            // Actually, if redirect throws, we typically don't reach here in the same way.
            // But for safety:
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#1a1a1a] w-full max-w-md rounded-3xl p-6 shadow-2xl border border-white/10 animate-in slide-in-from-bottom-10">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-white">Bevestig Boeking</h3>
                        <p className="text-gray-400">
                            {format(selectedDate, "EEEE d MMMM, HH:mm", { locale: nl })}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-white/10 rounded-full hover:bg-white/20 text-white transition-colors">
                        ✕
                    </button>
                </div>

                {/* Mode Selection */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <button
                        onClick={() => setMode("private")}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${mode === "private"
                            ? "border-blue-500 bg-blue-500/20"
                            : "border-white/10 hover:border-white/20 bg-white/5"
                            }`}
                    >
                        <div className="font-bold text-white">Privé Baan</div>
                        <div className="text-xs text-gray-400 mt-1">Alleen voor vrienden</div>
                    </button>
                    <button
                        onClick={() => setMode("match")}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${mode === "match"
                            ? "border-purple-500 bg-purple-500/20"
                            : "border-white/10 hover:border-white/20 bg-white/5"
                            }`}
                    >
                        <div className="font-bold text-white">Open Match</div>
                        <div className="text-xs text-gray-400 mt-1">Zoek medespelers</div>
                    </button>
                </div>

                <form action={handleSubmit} className="space-y-6">
                    <input type="hidden" name="clubId" value={clubId} />
                    <input type="hidden" name="courtId" value={courtId} />
                    <input type="hidden" name="userId" value={userId} />
                    <input type="hidden" name="bookingDate" value={format(selectedDate, "yyyy-MM-dd")} />
                    <input type="hidden" name="startTime" value={format(selectedDate, "HH:mm")} />
                    {/* Default 1.5 hour duration for now, or calculate based on next slot */}
                    <input type="hidden" name="endTime" value={format(new Date(selectedDate.getTime() + 90 * 60000), "HH:mm")} />
                    <input type="hidden" name="attendees" value="4" />

                    {/* Split Payment Toggle */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                            <div>
                                <div className="font-medium text-white">Split Payment</div>
                                <div className="text-xs text-gray-400">Iedereen betaalt zijn deel</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={splitPayment}
                                    onChange={(e) => setSplitPayment(e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]"></div>
                            </label>
                        </div>

                        {/* Select Friends Placeholder */}
                        {splitPayment && (
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5 animate-in slide-in-from-top-2">
                                <label className="block text-sm font-bold text-gray-300 mb-2">Nodig vrienden uit</label>
                                <div className="flex items-center gap-2">
                                    <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center border border-dashed border-gray-500 text-gray-400 hover:text-white hover:border-white cursor-pointer transition-colors">
                                        +
                                    </div>
                                    <span className="text-xs text-gray-500 italic">Selecteer uit contacten...</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Summary & Pay */}
                    <div className="border-t border-white/10 pt-4">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-gray-400">Totaal</span>
                            <span className="text-2xl font-bold text-white">€{price}</span>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full py-4 rounded-xl font-bold text-white text-lg shadow-lg transition-all ${mode === "match"
                                ? "bg-purple-600 hover:bg-purple-700 shadow-purple-900/50"
                                : "bg-blue-600 hover:bg-blue-700 shadow-blue-900/50"
                                }`}
                        >
                            {isSubmitting ? "Bezig..." : mode === "match" ? "Start Open Match" : "Boek & Betaal"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
