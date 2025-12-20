"use client";

interface BookingSlotProps {
    time: string;
    price: number;
    courtType: 'single' | 'double';
    isAvailable: boolean;
    isSelected?: boolean;
    onClick?: () => void;
}

export default function BookingSlot({
    time,
    price,
    courtType,
    isAvailable,
    isSelected = false,
    onClick
}: BookingSlotProps) {
    const baseClasses = "relative group cursor-pointer rounded-2xl p-4 border-2 transition-all duration-300";

    const stateClasses = isSelected
        ? "bg-blue-600 border-blue-500 shadow-xl shadow-blue-600/30"
        : isAvailable
            ? "bg-white/5 border-white/10 hover:bg-white/10 hover:border-blue-500/50 hover:shadow-lg"
            : "bg-white/[0.02] border-white/5 opacity-50 cursor-not-allowed";

    return (
        <button
            onClick={isAvailable ? onClick : undefined}
            disabled={!isAvailable}
            className={`${baseClasses} ${stateClasses}`}
        >
            {/* Court Type Icon */}
            <div className="absolute top-2 right-2">
                {courtType === 'single' ? (
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center group-hover:scale-110 transition-transform" title="Enkel">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-purple-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                        </svg>
                    </div>
                ) : (
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center group-hover:scale-110 transition-transform" title="Dubbel">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-cyan-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                        </svg>
                    </div>
                )}
            </div>

            {/* Time */}
            <div className={`text-2xl font-black mb-2 ${isSelected ? 'text-white' : isAvailable ? 'text-white' : 'text-gray-600'}`}>
                {time}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-1">
                <span className={`text-lg font-bold ${isSelected ? 'text-blue-100' : isAvailable ? 'text-blue-400' : 'text-gray-600'}`}>
                    €{price.toFixed(2)}
                </span>
                <span className={`text-xs ${isSelected ? 'text-blue-200' : isAvailable ? 'text-gray-400' : 'text-gray-700'}`}>
                    /90min
                </span>
            </div>

            {/* Availability Badge */}
            {!isAvailable && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 rounded-2xl backdrop-blur-sm">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Bezet
                    </span>
                </div>
            )}

            {/* Selection Glow */}
            {isSelected && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-400 opacity-20 blur-xl -z-10"></div>
            )}

            {/* Hover Indicator */}
            {isAvailable && !isSelected && (
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-blue-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                </div>
            )}
        </button>
    );
}
