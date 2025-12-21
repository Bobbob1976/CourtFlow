import { createClient } from "@/utils/supabase/server";
import SettingsForm from "@/components/admin/SettingsForm";

export default async function AdminSettingsPage() {
    const supabase = createClient();

    // Fetch club details
    const { data: clubs } = await supabase.from("clubs").select("*").limit(1);
    const club = clubs?.[0];

    if (!club) {
        return <div className="p-6 text-white bg-red-500/10 rounded-xl">Geen club gevonden. Start eerst de onboarding.</div>;
    }

    return (
        <div className="p-6 max-w-4xl mx-auto pb-20">
            <h1 className="text-3xl font-extrabold text-white mb-2">Club Instellingen</h1>
            <p className="text-gray-400 mb-8">Beheer je profiel en de uitstraling van je club app.</p>

            {/* Client Component with Interactivity */}
            <SettingsForm club={club} />
        </div>
    );
}
