'use client';

import { useState } from 'react';
import { updateSettings } from '@/app/actions/admin-settings'; // We'll verify/create this action next

// High quality Padel presets
const BANNER_PRESETS = [
    { id: 1, url: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=1600&auto=format&fit=crop', name: 'Blue Court' },
    { id: 2, url: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1600&auto=format&fit=crop', name: 'Clay Court' },
    { id: 3, url: 'https://images.unsplash.com/photo-1624653697960-aa228c2e633d?w=1600&auto=format&fit=crop', name: 'Action Shot' },
    { id: 4, url: 'https://images.unsplash.com/photo-1599586120429-48285b6a7a81?w=1600&auto=format&fit=crop', name: 'Outdoor Sun' },
];

export default function SettingsForm({ club }: { club: any }) {
    const [themeColor, setThemeColor] = useState(club.primary_color || '#C4FF0D');
    const [bannerUrl, setBannerUrl] = useState(club.banner_url || '');
    const [logoUrl, setLogoUrl] = useState(club.logo_url || '');
    const [isSaving, setIsSaving] = useState(false);

    return (
        <form action={async (formData) => {
            setIsSaving(true);
            await updateSettings(formData);
            setIsSaving(false);
            alert('Instellingen opgeslagen! ✅');
        }} className="space-y-8">

            {/* 1. Algemene Informatie */}
            <div className="bg-[#1a1a1a] p-8 rounded-3xl border border-white/10 shadow-xl">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm">📍</span>
                    Algemeen
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-gray-400">Club Naam</label>
                        <input
                            type="text"
                            name="name"
                            defaultValue={club.name}
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-[#C4FF0D] focus:ring-1 focus:ring-[#C4FF0D] outline-none transition-all font-bold"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-gray-400">Subdomein</label>
                        <div className="flex items-center gap-2">
                            <span className="text-gray-600 font-mono text-sm">courtflow.app/</span>
                            <input
                                type="text"
                                name="subdomain"
                                defaultValue={club.subdomain}
                                className="flex-1 bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-[#C4FF0D] focus:ring-1 focus:ring-[#C4FF0D] outline-none transition-all font-mono text-sm"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Personal Branding & Styling */}
            <div className="bg-[#1a1a1a] p-8 rounded-3xl border border-white/10 shadow-xl relative overflow-hidden">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 relative z-10">
                    <span className="w-8 h-8 rounded-lg bg-[#C4FF0D]/20 text-[#C4FF0D] flex items-center justify-center text-sm">🎨</span>
                    Branding & Styling
                </h2>

                <div className="space-y-8 relative z-10">

                    {/* Banner Image + Voorbeeld */}
                    <div className="space-y-4">
                        <label className="text-xs font-bold uppercase text-gray-400">Banner Afbeelding</label>

                        {/* Preview Area */}
                        <div className="relative h-48 w-full rounded-2xl overflow-hidden border-2 border-dashed border-white/10 bg-black/40 group">
                            {bannerUrl ? (
                                <>
                                    <img src={bannerUrl} className="w-full h-full object-cover" alt="Banner Preview" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <p className="text-white font-bold">Huidige Banner</p>
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-500">
                                    Geen afbeelding geselecteerd
                                </div>
                            )}
                        </div>

                        {/* Presets - De Gebruiksvriendelijke Oplossing */}
                        <div>
                            <p className="text-xs text-gray-400 mb-2">Kies een achtergrond of plak een eigen link:</p>
                            <div className="grid grid-cols-4 gap-2 mb-4">
                                {BANNER_PRESETS.map((preset) => (
                                    <button
                                        type="button"
                                        key={preset.id}
                                        onClick={() => setBannerUrl(preset.url)}
                                        className={`relative h-16 rounded-lg overflow-hidden border-2 transition-all ${bannerUrl === preset.url ? 'border-[#C4FF0D] scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                                            }`}
                                    >
                                        <img src={preset.url} className="w-full h-full object-cover" alt={preset.name} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* URL Input (Hidden logic but visible for custom) */}
                        <input
                            type="text" // Changed from url to text to be more forgiving
                            name="banner_url"
                            placeholder="Of plak hier je eigen afbeeldingslink..."
                            value={bannerUrl}
                            onChange={(e) => setBannerUrl(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white text-sm font-mono text-gray-300 focus:border-[#C4FF0D] outline-none"
                        />
                    </div>

                    {/* Logo Image */}
                    <div className="space-y-4 pt-4 border-t border-white/5">
                        <label className="text-xs font-bold uppercase text-gray-400">Logo</label>
                        <div className="flex gap-6 items-start">
                            {/* Logo Preview */}
                            <div className="w-24 h-24 rounded-xl bg-black/40 border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                                {logoUrl ? (
                                    <img src={logoUrl} className="w-full h-full object-contain p-2" alt="Logo" />
                                ) : (
                                    <span className="text-2xl opacity-20">LOGO</span>
                                )}
                            </div>

                            <div className="flex-1 space-y-2">
                                <input
                                    type="text"
                                    name="logo_url"
                                    placeholder="https://jouw-site.nl/logo.png"
                                    value={logoUrl}
                                    onChange={(e) => setLogoUrl(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white text-sm font-mono text-gray-300 focus:border-[#C4FF0D] outline-none"
                                />
                                <div className="text-xs text-gray-500 bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
                                    ℹ️ <strong>Tip:</strong> Heb je al een website? Klik daar met de rechtermuisknop op je logo en kies <em>"Afbeeldingsadres kopiëren"</em>. Plak dat hierboven.
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Brand Color */}
                    <div className="space-y-4 pt-4 border-t border-white/5">
                        <label className="text-xs font-bold uppercase text-gray-400">Primaire Kleur</label>
                        <div className="flex items-center gap-4 bg-black/40 p-4 rounded-xl border border-white/5">
                            <input
                                type="color"
                                name="primary_color"
                                value={themeColor}
                                onChange={(e) => setThemeColor(e.target.value)}
                                className="w-12 h-12 rounded-lg border-none cursor-pointer bg-transparent"
                            />
                            <div className="space-y-1">
                                <div className="text-white font-bold" style={{ color: themeColor }}>Accent Kleur Voorbeeld</div>
                                <div className="text-xs text-gray-500">Klik op het blokje om je clubkleur te kiezen.</div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <div className="pt-4 flex justify-end">
                <button
                    type="submit"
                    disabled={isSaving}
                    className="px-8 py-4 rounded-xl font-bold text-[#0A1628] bg-[#C4FF0D] hover:scale-105 transition-transform shadow-lg shadow-[#C4FF0D]/20 flex items-center gap-2 disabled:opacity-50 disabled:scale-100"
                >
                    {isSaving ? 'Opslaan...' : 'Instellingen Opslaan'}
                </button>
            </div>
        </form>
    );
}
