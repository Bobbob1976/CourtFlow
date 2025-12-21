"use client";

import { useState } from "react";
import ImageUploadManager from "@/components/admin/ImageUploadManager";
import ImageGallery from "@/components/admin/ImageGallery";
import { Image as ImageIcon, Info } from "lucide-react";
import { setClubBranding } from "@/app/actions/branding-actions";

export default function ClubImagesClient({ clubId }: { clubId: string }) {
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleUploadComplete = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    const handleSetBranding = async (type: 'banner' | 'logo', url: string) => {
        try {
            await setClubBranding(clubId, type, url);
            alert(`${type === 'banner' ? 'Banner' : 'Logo'} succesvol ingesteld! 🚀`);
        } catch (error) {
            console.error(error);
            alert('Er ging iets mis bij het instellen.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-5xl font-bold text-white mb-4 flex items-center gap-4">
                        <ImageIcon className="w-12 h-12 text-blue-400" />
                        Afbeeldingen Beheren
                    </h1>
                    <p className="text-xl text-gray-400">
                        Upload en beheer je eigen court en club afbeeldingen.
                    </p>
                </div>

                {/* Info Banner */}
                <div className="mb-8 bg-blue-600/20 border border-blue-500/30 rounded-2xl p-6">
                    <div className="flex items-start gap-4">
                        <Info className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="text-white font-bold mb-2">Hoe werkt het?</h3>
                            <p className="text-gray-300 text-sm mb-2">
                                Upload hier al je afbeeldingen. Gebruik daarna de knoppen
                                <span className="inline-block px-2 py-0.5 mx-1 bg-[#C4FF0D] text-black text-xs font-bold rounded">Kies Banner</span>
                                om ze direct live te zetten!
                            </p>
                        </div>
                    </div>
                </div>

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
            </div>
        </div>
    );
}
