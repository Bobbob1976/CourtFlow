"use client";

import { useState } from "react";
import { submitMatchScore } from "@/app/actions/match-actions";

interface ScoreSubmissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    booking: any; // Type this properly in real app
}

export default function ScoreSubmissionModal({ isOpen, onClose, booking }: ScoreSubmissionModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    // Mock players for now if not in booking
    // In real app, booking should have 'players' or 'attendees'
    const team1_p1 = booking.user_id; // Booker
    const team1_p2 = "player_2_id"; // Placeholder
    const team2_p1 = "player_3_id"; // Placeholder
    const team2_p2 = "player_4_id"; // Placeholder

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true);
        setError(null);

        // Append hidden fields
        formData.append("bookingId", booking.id);
        formData.append("team1_p1", team1_p1);
        formData.append("team1_p2", team1_p2);
        formData.append("team2_p1", team2_p1);
        formData.append("team2_p2", team2_p2);

        const result = await submitMatchScore({}, formData);

        if (result.error) {
            setError(result.error);
            setIsSubmitting(false);
        } else {
            // Success
            onClose();
            // Ideally show success toast
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#1a1a1a] w-full max-w-md rounded-3xl p-6 shadow-2xl border border-white/10 animate-in zoom-in-95">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">Match Resultaat</h3>
                    <button onClick={onClose} className="p-2 bg-white/10 rounded-full hover:bg-white/20 text-white transition-colors">✕</button>
                </div>

                <form action={handleSubmit} className="space-y-6">
                    {/* Teams Visual */}
                    <div className="flex justify-between items-center px-2">
                        <div className="text-center">
                            <div className="font-bold text-blue-400">Team A</div>
                            <div className="text-xs text-gray-400">Jij & Partner</div>
                        </div>
                        <div className="text-gray-500 font-bold">VS</div>
                        <div className="text-center">
                            <div className="font-bold text-purple-400">Team B</div>
                            <div className="text-xs text-gray-400">Tegenstanders</div>
                        </div>
                    </div>

                    {/* Sets Inputs */}
                    <div className="space-y-3">
                        <SetInput label="Set 1" n={1} />
                        <SetInput label="Set 2" n={2} />
                        <SetInput label="Set 3 (Optioneel)" n={3} optional />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 rounded-xl font-bold text-white text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-900/20 transition-all disabled:opacity-50"
                    >
                        {isSubmitting ? "Verwerken..." : "Bevestig Score"}
                    </button>
                </form>
            </div>
        </div>
    );
}

function SetInput({ label, n, optional }: { label: string, n: number, optional?: boolean }) {
    return (
        <div className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/5">
            <span className="text-sm font-bold text-gray-400 w-24">{label}</span>
            <input
                type="number"
                name={`s${n}_t1`}
                placeholder="0"
                className="w-12 h-10 text-center bg-[#121212] rounded-lg border border-white/10 text-white font-bold focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                required={!optional}
                min="0" max="7"
            />
            <span className="text-gray-600">-</span>
            <input
                type="number"
                name={`s${n}_t2`}
                placeholder="0"
                className="w-12 h-10 text-center bg-[#121212] rounded-lg border border-white/10 text-white font-bold focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                required={!optional}
                min="0" max="7"
            />
        </div>
    )
}
