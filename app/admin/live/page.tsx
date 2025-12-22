import { createClient } from "@/utils/supabase/server";
import VisualCourtGrid from "@/components/admin/VisualCourtGrid";

export default async function AdminLivePage() {
    const supabase = createClient();

    // Fetch club context
    const { data: clubs } = await supabase.from('clubs').select('id, name').limit(1);
    const club = clubs?.[0];

    if (!club) return <div className="p-8 text-white">Geen club gevonden.</div>;

    return (
        <div className="p-6 space-y-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">Live Court View</h1>
                    <p className="text-gray-400 text-sm">Real-time baanbeheer voor {club.name}</p>
                </div>

                {/* Legenda */}
                <div className="flex gap-4">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span className="w-3 h-3 rounded bg-green-500/20 border border-green-500/50"></span>
                        Beschikbaar
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span className="w-3 h-3 rounded bg-blue-500/20 border border-blue-500/50"></span>
                        Bezet
                    </div>
                </div>
            </div>

            {/* The Unified Grid Component */}
            <VisualCourtGrid clubId={club.id} />
        </div>
    );
}
