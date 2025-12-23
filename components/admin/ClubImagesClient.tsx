"use client";

import { useState } from "react";
import ImageUploadManager from "@/components/admin/ImageUploadManager";
import ImageGallery from "@/components/admin/ImageGallery";
import { Image as ImageIcon, Info, Database, Sliders } from "lucide-react";
import { setClubBranding, updateBannerPosition } from "@/app/actions/branding-actions";

interface ClubImagesClientProps {
    clubId: string;
    clubName: string;
    initialBannerUrl?: string;
    initialBannerPosition?: number;
}

export default function ClubImagesClient({ clubId, clubName, initialBannerUrl, initialBannerPosition = 20 }: ClubImagesClientProps) {
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [bannerUrl, setBannerUrl] = useState<string | null>(initialBannerUrl || null);
    const [bannerPos, setBannerPos] = useState<number>(initialBannerPosition);
    const [isSavingPos, setIsSavingPos] = useState(false);

    const handleUploadComplete = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    const handleSetBranding = async (type: 'banner' | 'logo', url: string) => {
        try {
            await setClubBranding(clubId, type, url);
            if (type === 'banner') setBannerUrl(url);
            alert(`${type === 'banner' ? 'Banner' : 'Logo'} succesvol ingesteld! 🚀`);
        } catch (error) {
            console.error(error);
            alert('Er ging iets mis bij het instellen.');
        }
    };

    const handleSavePosition = async () => {
        setIsSavingPos(true);
        try {
            await updateBannerPosition(clubId, bannerPos);
            // Optional: alert('Positie opgeslagen!');
        } catch (err) {
            alert('Fout bij opslaan positie');
        } finally {
            setIsSavingPos(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-12">
                    <div className="flex items-center gap-4 mb-4">
                        <ImageIcon className="w-12 h-12 text-blue-400" />
                        <div>
                            <h1 className="text-4xl font-bold text-white">
                                Afbeeldingen Beheren
                            </h1>
                            {clubName && (
                                <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm font-bold border border-blue-500/30">
                                    {clubName}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Current Banner Settings */}
                {bannerUrl && (
                    <div className="mb-12 bg-[#0A1628] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                        <div className="relative h-64 w-full group">
                            <div className="absolute top-4 left-4 z-20 bg-black/50 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-white border border-white/10">
                                Live Preview
                            </div>
                            <img
                                src={bannerUrl}
                                className="w-full h-full object-cover transition-all duration-300"
                                style={{ objectPosition: `center ${bannerPos}%` }}
                                alt="Banner Preview"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628] via-transparent to-transparent pointer-events-none" />

                            <div className="absolute bottom-0 left-0 right-0 p-6 z-20 bg-gradient-to-t from-black/80 to-transparent">
                                <div className="max-w-md">
                                    <label className="text-white font-bold flex items-center gap-2 mb-3">
                                        <Sliders className="w-5 h-5 text-blue-400" />
                                        Verticale Positie: <span className="text-blue-400">{bannerPos}%</span>
                                    </label>
                                    <input
                                        type="range"
                                        min="0" max="100"
                                        value={bannerPos}
                                        onChange={(e) => setBannerPos(Number(e.target.value))}
                                        onMouseUp={handleSavePosition}
                                        onTouchEnd={handleSavePosition}
                                        className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-colors"
                                    />
                                    <div className="flex justify-between text-[10px] text-gray-400 mt-2 font-mono uppercase tracking-wider">
                                        <span>Boven</span>
                                        <span>Midden</span>
                                        <span>Onder</span>
                                    </div>
                                    <p className="text-xs text-blue-200/70 mt-2">
                                        {isSavingPos ? "⏳ Opslaan..." : "Sleep de slider om de foto te verschuiven. Laat los om op te slaan."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Upload Section */}
                <div className="mb-12">
                    <ImageUploadManager
                        clubId={clubId}
                        onUploadComplete={handleUploadComplete}
                    />
                </div>

                {/* Gallery Section */}
                <ImageGallery
                    clubId={clubId}
                    refreshTrigger={refreshTrigger}
                    onSetBranding={handleSetBranding}
                />

                {/* DEBUG SECTION */}
                <div className="mt-12 pt-8 border-t border-white/5">
                    <details className="group">
                        <summary className="flex items-center gap-2 text-gray-500 cursor-pointer hover:text-white transition-colors text-sm font-mono">
                            <Database className="w-4 h-4" />
                            Toon Debug Informatie
                        </summary>
                        <div className="mt-4 p-4 bg-black/50 rounded-xl font-mono text-xs text-green-400 overflow-x-auto border border-green-500/20">
                            <p><strong>Club ID (Context):</strong> {clubId}</p>
                            <p><strong>Club Naam:</strong> {clubName}</p>
                            <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
                            <p className="text-gray-500 mt-2">
                                Als je uploads niet ziet, check of 'Club ID' hierboven overeenkomt met de entry in je 'clubs' tabel in Supabase.
                                Check ook de 'club_images' tabel of er rijen zijn met ditzelfde club_id.
                            </p>
                        </div>
                    </details>
                </div>
            </div>
        </div>
    );
}
