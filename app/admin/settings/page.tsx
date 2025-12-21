import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminSettingsPage() {
    const supabase = createClient();

    // Fetch club details
    const { data: clubs } = await supabase.from("clubs").select("*").limit(1);
    const club = clubs?.[0];

    if (!club) {
        return <div className="p-6 text-white bg-red-500/10 rounded-xl">Geen club gevonden. Start eerst de onboarding.</div>;
    }

    async function updateSettings(formData: FormData) {
        "use server";
        const supabase = createClient();

        const name = formData.get("name") as string;
        const subdomain = formData.get("subdomain") as string;

        // Branding fields
        const banner_url = formData.get("banner_url") as string;
        const logo_url = formData.get("logo_url") as string;
        const primary_color = formData.get("primary_color") as string;

        await supabase
            .from("clubs")
            .update({
                name,
                subdomain,
                banner_url: banner_url || null,
                logo_url: logo_url || null,
                primary_color: primary_color || '#C4FF0D'
            })
            .eq("id", club.id);

        redirect("/admin/settings");
    }

    return (
        <div className="p-6 max-w-4xl mx-auto pb-20">
            <h1 className="text-3xl font-extrabold text-white mb-2">Club Instellingen</h1>
            <p className="text-gray-400 mb-8">Beheer je profiel en de uitstraling van je club app.</p>

            <form action={updateSettings} className="space-y-8">

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
                            <label className="text-xs font-bold uppercase text-gray-400">Subdomein (URL)</label>
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
                    <div className="absolute top-0 right-0 p-32 bg-[#C4FF0D]/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 relative z-10">
                        <span className="w-8 h-8 rounded-lg bg-[#C4FF0D]/20 text-[#C4FF0D] flex items-center justify-center text-sm">🎨</span>
                        Branding & Styling
                    </h2>

                    <div className="space-y-6 relative z-10">

                        {/* Banner Image */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-gray-400">Banner Afbeelding (URL)</label>
                            <input
                                type="url"
                                name="banner_url"
                                placeholder="https://..."
                                defaultValue={club.banner_url || ''}
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-[#C4FF0D] focus:ring-1 focus:ring-[#C4FF0D] outline-none transition-all text-sm font-mono text-gray-300"
                            />
                            <p className="text-xs text-gray-500">Tip: Gebruik een hoge resolutie foto van je padelbanen.</p>
                        </div>

                        {/* Logo Image */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-gray-400">Logo (URL)</label>
                            <input
                                type="url"
                                name="logo_url"
                                placeholder="https://..."
                                defaultValue={club.logo_url || ''}
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-[#C4FF0D] focus:ring-1 focus:ring-[#C4FF0D] outline-none transition-all text-sm font-mono text-gray-300"
                            />
                        </div>

                        {/* Brand Color */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-gray-400">Primaire Kleur (Accent)</label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="color"
                                    name="primary_color"
                                    defaultValue={club.primary_color || '#C4FF0D'}
                                    className="w-16 h-16 rounded-xl border-none cursor-pointer bg-transparent"
                                />
                                <div className="space-y-1">
                                    <div className="text-white font-bold">Accent Kleur</div>
                                    <div className="text-xs text-gray-500">Wordt gebruikt voor knoppen, highlights en acties.</div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                <div className="pt-4 flex justify-end">
                    <button
                        type="submit"
                        className="px-8 py-4 rounded-xl font-bold text-[#0A1628] bg-[#C4FF0D] hover:scale-105 transition-transform shadow-lg shadow-[#C4FF0D]/20 flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        Instellingen Opslaan
                    </button>
                </div>
            </form>
        </div>
    );
}
