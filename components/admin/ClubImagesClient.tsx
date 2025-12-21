"use client";

import { useState } from "react";
import ImageUploadManager from "@/components/admin/ImageUploadManager";
import ImageGallery from "@/components/admin/ImageGallery";
import { Image as ImageIcon, Info, Database } from "lucide-react";
import { setClubBranding } from "@/app/actions/branding-actions";

export default function ClubImagesClient({ clubId, clubName }: { clubId: string, clubName: string }) {
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
