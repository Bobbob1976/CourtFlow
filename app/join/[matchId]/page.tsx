"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function JoinMatchPage() {
    const params = useParams();
    const matchId = params.matchId as string;
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
        const mobile = /android|iPad|iPhone|iPod/i.test(userAgent);
        setIsMobile(mobile);

        if (mobile) {
            // Attempt to open the app via Custom Scheme
            // Timeout to fallback if app not installed
            const timeout = setTimeout(() => {
                // Fallback logic (stay on page or redirect to store)
                console.log("App not installed or did not open.");
            }, 2000);

            window.location.href = `courtflow://join/${matchId}`;

            return () => clearTimeout(timeout);
        }
    }, [matchId]);

    return (
        <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]"></div>
            </div>

            <div className="relative z-10 max-w-md w-full text-center space-y-8">
                {/* Logo */}
                <div className="text-3xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                    COURTFLOW
                </div>

                {/* Invite Card */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                    <div className="w-20 h-20 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full mx-auto mb-6 flex items-center justify-center text-3xl shadow-lg shadow-blue-500/30">
                        🎾
                    </div>

                    <h1 className="text-2xl font-bold mb-2">Je bent uitgenodigd!</h1>
                    <p className="text-gray-400 mb-6">
                        Pascal daagt je uit voor een potje Padel. We missen nog 1 speler om het team compleet te maken.
                    </p>

                    <div className="bg-[#121212]/50 rounded-xl p-4 mb-6 border border-white/5">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-gray-500 uppercase">Locatie</span>
                            <span className="text-sm font-bold text-white">PadelDam, Amsterdam</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-500 uppercase">Tijd</span>
                            <span className="text-sm font-bold text-blue-400">Dinsdag, 14:00</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={() => window.location.href = `courtflow://join/${matchId}`}
                            className="w-full py-3.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/20"
                        >
                            Open in App
                        </button>
                        <Link
                            href="/login"
                            className="block w-full py-3.5 rounded-xl font-bold text-white bg-white/10 hover:bg-white/20 transition-colors"
                        >
                            Verder in Browser
                        </Link>
                    </div>
                </div>

                {/* Store Badges */}
                <div className="flex justify-center gap-4 opacity-70 grayscale hover:grayscale-0 transition-all">
                    {/* Mock Badges */}
                    <div className="h-10 w-32 bg-white/10 rounded-lg flex items-center justify-center text-xs font-bold border border-white/10">
                        App Store
                    </div>
                    <div className="h-10 w-32 bg-white/10 rounded-lg flex items-center justify-center text-xs font-bold border border-white/10">
                        Google Play
                    </div>
                </div>
            </div>
        </div>
    );
}
