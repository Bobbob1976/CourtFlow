"use client";

import { useState } from "react";

interface Court {
    id: string;
    name: string;
    sport: string;
    hourly_rate: number;
    is_available: boolean;
}

interface SwipeableCourtSelectorProps {
    courts: Court[];
    selectedCourtId?: string;
    onSelectCourt: (courtId: string) => void;
}

export default function SwipeableCourtSelector({
    courts,
    selectedCourtId,
    onSelectCourt,
}: SwipeableCourtSelectorProps) {
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (touchStart - touchEnd > 75) {
            // Swiped left
            const currentIndex = courts.findIndex(c => c.id === selectedCourtId);
            if (currentIndex < courts.length - 1) {
                onSelectCourt(courts[currentIndex + 1].id);
            }
        }

        if (touchStart - touchEnd < -75) {
            // Swiped right
            const currentIndex = courts.findIndex(c => c.id === selectedCourtId);
            if (currentIndex > 0) {
                onSelectCourt(courts[currentIndex - 1].id);
            }
        }
    };

    return (
        <div className="lg:hidden">
            {/* Swipe Indicator */}
            <div className="flex items-center justify-center gap-2 mb-4">
                <div className="text-gray-400 text-sm">← Swipe to change court →</div>
            </div>

            {/* Court Cards Container */}
            <div
                className="overflow-x-auto scrollbar-hide snap-x snap-mandatory"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div className="flex gap-4 px-4 pb-4">
                    {courts.map((court) => {
                        const isSelected = court.id === selectedCourtId;
                        return (
                            <div
                                key={court.id}
                                onClick={() => onSelectCourt(court.id)}
                                className={`flex-shrink-0 w-[85vw] snap-center transition-all duration-300 ${isSelected ? "scale-100" : "scale-95 opacity-60"
                                    }`}
                            >
                                <div
                                    className={`relative p-6 rounded-3xl border-2 transition-all ${isSelected
                                            ? "bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-blue-500"
                                            : "bg-white/5 border-white/10"
                                        }`}
                                >
                                    {/* Availability Badge */}
                                    <div className="absolute top-4 right-4">
                                        <div
                                            className={`px-3 py-1 rounded-full text-xs font-bold ${court.is_available
                                                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                                    : "bg-red-500/20 text-red-400 border border-red-500/30"
                                                }`}
                                        >
                                            {court.is_available ? "Available" : "Occupied"}
                                        </div>
                                    </div>

                                    {/* Court Info */}
                                    <div className="mb-6">
                                        <h3 className="text-3xl font-bold text-white mb-2">{court.name}</h3>
                                        <p className="text-gray-400 text-lg">{court.sport}</p>
                                    </div>

                                    {/* Price */}
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-bold text-white">€{court.hourly_rate}</span>
                                        <span className="text-gray-400">/hour</span>
                                    </div>

                                    {/* Book Button */}
                                    {court.is_available && (
                                        <button
                                            className={`w-full mt-6 py-4 rounded-xl font-bold text-white transition-all ${isSelected
                                                    ? "bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/50"
                                                    : "bg-white/10"
                                                }`}
                                        >
                                            {isSelected ? "Book This Court" : "Select Court"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Dots Indicator */}
            <div className="flex items-center justify-center gap-2 mt-4">
                {courts.map((court, index) => (
                    <div
                        key={court.id}
                        className={`h-2 rounded-full transition-all ${court.id === selectedCourtId
                                ? "w-8 bg-blue-500"
                                : "w-2 bg-white/20"
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}
