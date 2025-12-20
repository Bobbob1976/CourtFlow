import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminSettingsPage() {
    const supabase = createClient();

    // Fetch club details (assuming single club for now or first one)
    const { data: clubs } = await supabase.from("clubs").select("*").limit(1);
    const club = clubs?.[0];

    if (!club) {
        return <div className="p-6 text-white">No club found.</div>;
    }

    async function updateSettings(formData: FormData) {
        "use server";
        const supabase = createClient();
        const name = formData.get("name") as string;
        const subdomain = formData.get("subdomain") as string;

        await supabase
            .from("clubs")
            .update({ name, subdomain })
            .eq("id", club.id);

        redirect("/admin/settings");
    }

    return (
        <div className="p-6 max-w-2xl">
            <h1 className="text-2xl font-bold text-white mb-6">Club Settings</h1>

            <form action={updateSettings} className="space-y-6 bg-[#1a1a1a] p-8 rounded-2xl border border-white/10">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-400">Club Name</label>
                    <input
                        type="text"
                        name="name"
                        defaultValue={club.name}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-400">Subdomain</label>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-500 font-mono">courtflow.app/</span>
                        <input
                            type="text"
                            name="subdomain"
                            defaultValue={club.subdomain}
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        className="w-full py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/20"
                    >
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
}
