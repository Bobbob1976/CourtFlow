"use client";

import { useState } from "react";
import ImageUploadManager from "@/components/admin/ImageUploadManager";
import ImageGallery from "@/components/admin/ImageGallery";
import { Image as ImageIcon, Info } from "lucide-react";

export default function ClubImagesPage() {
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // In production, get this from auth/session
    const clubId = "90f93d47-b438-427c-8b33-0597817c1d96"; // Demo club ID

    const handleUploadComplete = () => {
        setRefreshTrigger(prev => prev + 1);
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
                        Upload en beheer je eigen court en club afbeeldingen voor een persoonlijke touch
                    </p>
                </div>

                {/* Info Banner */}
                <div className="mb-8 bg-blue-600/20 border border-blue-500/30 rounded-2xl p-6">
                    <div className="flex items-start gap-4">
                        <Info className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="text-white font-bold mb-2">Hoe werkt het?</h3>
                            <ul className="text-gray-300 text-sm space-y-1">
                                <li>• <strong>Booking Cards:</strong> Afbeeldingen die getoond worden op booking cards</li>
                                <li>• <strong>Court:</strong> Specifieke court afbeeldingen</li>
                                <li>• <strong>Club:</strong> Algemene club foto's</li>
                                <li>• <strong>Hero:</strong> Grote banner afbeeldingen voor de homepage</li>
                                <li>• <strong>Gallery:</strong> Foto's voor de galerij sectie</li>
                            </ul>
                            <p className="text-gray-400 text-sm mt-3">
                                💡 <strong>Tip:</strong> Upload actie shots van spelers voor de meest dynamische ervaring!
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
                />

                {/* Tips Section */}
                <div className="mt-12 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-2xl p-8">
                    <h3 className="text-2xl font-bold text-white mb-4">📸 Foto Tips</h3>
                    <div className="grid md:grid-cols-2 gap-6 text-gray-300">
                        <div>
                            <h4 className="font-bold text-white mb-2">✅ Goede Foto's:</h4>
                            <ul className="text-sm space-y-1">
                                <li>• Hoge resolutie (min. 1920x1080px)</li>
                                <li>• Goede belichting</li>
                                <li>• Actie shots van spelers</li>
                                <li>• Professionele uitstraling</li>
                                <li>• Horizontale oriëntatie</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-white mb-2">❌ Vermijd:</h4>
                            <ul className="text-sm space-y-1">
                                <li>• Lage kwaliteit/pixelige foto's</li>
                                <li>• Donkere of overbelichte foto's</li>
                                <li>• Lege banen zonder mensen</li>
                                <li>• Watermerken van anderen</li>
                                <li>• Verticale foto's voor booking cards</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
