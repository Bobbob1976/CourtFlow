"use client";

import Link from "next/link";

interface ClubVibeHeaderProps {
    clubName: string;
    clubId: string;
    availableCourts: number;
    totalCourts: number;
    clubImage?: string;
}

export default function ClubVibeHeader({
    clubName,
    clubId,
    availableCourts,
    totalCourts,
    clubImage
}: ClubVibeHeaderProps) {
    const availabilityPercentage = (availableCourts / totalCourts) * 100;
    const isHighAvailability = availabilityPercentage >= 50;
    const isMediumAvailability = availabilityPercentage >= 25 && availabilityPercentage < 50;

    return (
        <div className="relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl shadow-black/40 group">
            {/* Background with Gradient (no image to prevent 404) */}
            <div className="absolute inset-0">
                {clubImage && (
                    <div
                        className="absolute inset-0 bg-cover bg-center opacity-40 transition-transform duration-700 group-hover:scale-105"
                        style={{ backgroundImage: `url('${clubImage}')` }}
                    ></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-900/80"></div>
            </div>

            {/* Content */}
            <div className="relative p-8 flex items-center justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                            🏆 Club van de dag
                        </span>
                        <div className="h-1 w-1 rounded-full bg-blue-500 animate-pulse"></div>
                    </div>

                    <h2 className="text-3xl font-extrabold text-white mb-4 tracking-tight">
                        {clubName}
                    </h2>

                    {/* Availability Status */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10">
                            <div className={`w-2 h-2 rounded-full ${isHighAvailability ? 'bg-green-500' : isMediumAvailability ? 'bg-yellow-500' : 'bg-red-500'} animate-pulse shadow-lg ${isHighAvailability ? 'shadow-green-500/50' : isMediumAvailability ? 'shadow-yellow-500/50' : 'shadow-red-500/50'}`}></div>
                            <span className="text-sm font-bold text-white">
                                {availableCourts} {availableCourts === 1 ? 'baan' : 'banen'} vrij
                            </span>
                        </div>

                        <div className="text-xs text-gray-400">
                            van {totalCourts} totaal
                        </div>
                    </div>
                </div>

                {/* CTA Button */}
                <Link
                    href={`/${clubId}`}
                    className="group/btn relative px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-lg shadow-xl shadow-blue-600/30 hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 overflow-hidden"
                >
                    <span className="relative z-10 flex items-center gap-2">
                        Direct Reserveren
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 transition-transform group-hover/btn:translate-x-1">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                        </svg>
                    </span>

                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-300 opacity-0 group-hover/btn:opacity-20 blur-xl transition-opacity"></div>
                </Link>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        </div>
    );
}
