"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

interface ChallengeModalProps {
    userId: string;
    clubId: string;
    onClose: () => void;
}

export default function ChallengeModal({ userId, clubId, onClose }: ChallengeModalProps) {
    const [selectedPlayer, setSelectedPlayer] = useState("");
    const [message, setMessage] = useState("");
    const [proposedTime, setProposedTime] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const supabase = createClient();

    async function sendChallenge() {
        if (!selectedPlayer || !proposedTime) {
            alert("Selecteer een speler en tijd!");
            return;
        }

        setLoading(true);

        const { error } = await supabase
            .from("challenges")
            .insert([{
                challenger_id: userId,
                challenged_id: selectedPlayer,
                club_id: clubId,
                message: message || "Laten we een potje spelen! 🎾",
                proposed_time: proposedTime,
                status: "pending"
            }]);

        if (!error) {
            setSent(true);
            setTimeout(() => onClose(), 2000);
        } else {
            alert("Fout bij versturen uitdaging!");
        }

        setLoading(false);
    }

    if (sent) {
        return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="glass-card rounded-3xl p-12 max-w-md w-full border-2 border-courtflow-green/50 text-center">
                    <div className="text-8xl mb-6 animate-bounce">🎉</div>
                    <h2 className="text-3xl font-black text-white mb-3">Challenge Sent!</h2>
                    <p className="text-gray-300">Je uitdaging is verstuurd. Succes! 🎾</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 fade-in-up">
            <div className="glass-card rounded-3xl p-8 max-w-2xl w-full border-2 border-white/20 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-black text-white mb-2">
                            Daag iemand uit! ⚔️
                        </h2>
                        <p className="text-gray-400">Stuur een challenge naar een medespeler</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                    >
                        <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Player Selection */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                        Selecteer speler 🎯
                    </label>
                    <select
                        value={selectedPlayer}
                        onChange={(e) => setSelectedPlayer(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border-2 border-white/10 text-white focus:border-courtflow-green/50 focus:outline-none transition-colors"
                    >
                        <option value="">Kies een speler...</option>
                        {/* TODO: Load from database */}
                        <option value="player1">Jan de Vries (Rating: 4.5)</option>
                        <option value="player2">Anna Bakker (Rating: 4.2)</option>
                        <option value="player3">Tom Jansen (Rating: 4.8)</option>
                    </select>
                </div>

                {/* Date/Time Selection */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                        Wanneer wil je spelen? 📅
                    </label>
                    <input
                        type="datetime-local"
                        value={proposedTime}
                        onChange={(e) => setProposedTime(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border-2 border-white/10 text-white focus:border-courtflow-green/50 focus:outline-none transition-colors"
                    />
                </div>

                {/* Message */}
                <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                        Persoonlijk bericht 💬 (optioneel)
                    </label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Bijv: Klaar voor een potje? Win je van mij? 😎"
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border-2 border-white/10 text-white placeholder-gray-500 focus:border-courtflow-green/50 focus:outline-none transition-colors resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                        {message.length}/200 karakters
                    </p>
                </div>

                {/* Preview */}
                <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-courtflow-orange/10 to-courtflow-green/10 border-2 border-courtflow-green/20">
                    <div className="text-sm text-gray-400 mb-2">Preview:</div>
                    <div className="flex items-start gap-4">
                        <div className="text-4xl">⚔️</div>
                        <div className="flex-1">
                            <p className="text-white font-semibold mb-2">
                                {message || "Laten we een potje spelen! 🎾"}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <span>📅</span>
                                <span>{proposedTime ? new Date(proposedTime).toLocaleDateString("nl-NL", {
                                    weekday: "short",
                                    day: "numeric",
                                    month: "short",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                }) : "Nog geen tijd gekozen"}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold transition-all duration-300"
                    >
                        Annuleren
                    </button>
                    <button
                        onClick={sendChallenge}
                        disabled={loading || !selectedPlayer || !proposedTime}
                        className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-courtflow-orange to-courtflow-green hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 text-white font-bold shadow-lg shadow-courtflow-green/20 transition-all duration-300"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Versturen...
                            </span>
                        ) : (
                            "Verstuur Challenge! ⚡"
                        )}
                    </button>
                </div>

                {/* Tips */}
                <div className="mt-6 p-4 rounded-xl bg-white/5">
                    <div className="flex items-start gap-3">
                        <span className="text-xl">💡</span>
                        <div className="flex-1">
                            <p className="text-sm text-gray-400">
                                <span className="text-white font-semibold">Pro tip:</span> Voeg een leuke uitdaging toe aan je bericht voor meer kans op acceptatie!
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Quick Challenge Button Component
export function QuickChallengeButton({ userId, clubId }: { userId: string; clubId: string }) {
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="glass-card rounded-2xl p-6 border-2 border-white/10 hover:border-courtflow-orange/50 card-hover group w-full"
            >
                <div className="flex items-center gap-4">
                    <div className="text-5xl group-hover:scale-110 transition-transform">⚔️</div>
                    <div className="flex-1 text-left">
                        <h3 className="text-xl font-bold text-white mb-1">Daag iemand uit!</h3>
                        <p className="text-sm text-gray-400">Stuur een challenge en bewijs jezelf</p>
                    </div>
                    <svg className="w-6 h-6 text-courtflow-orange group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </button>

            {showModal && (
                <ChallengeModal
                    userId={userId}
                    clubId={clubId}
                    onClose={() => setShowModal(false)}
                />
            )}
        </>
    );
}
