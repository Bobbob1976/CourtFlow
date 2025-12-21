import { createClient } from "@/utils/supabase/server";
import ClubImagesClient from "@/components/admin/ClubImagesClient";

export default async function ClubImagesPage() {
    const supabase = createClient();

    // Fetch the real club ID
    const { data: clubs } = await supabase.from('clubs').select('id').limit(1);
    const clubId = clubs?.[0]?.id;

    if (!clubId) {
        return <div className="p-8 text-white">Geen club gevonden.</div>;
    }

    return <ClubImagesClient clubId={clubId} />;
}
