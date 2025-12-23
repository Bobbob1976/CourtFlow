import { createClient } from "@/utils/supabase/server";
import ClubImagesClient from "@/components/admin/ClubImagesClient";

export default async function ClubImagesPage() {
    const supabase = createClient();

    // Fetch the real club ID and Name
    const { data: clubs } = await supabase.from('clubs').select('id, name, banner_url, banner_position_y').limit(1);
    const club = clubs?.[0];

    if (!club) {
        return <div className="p-8 text-white">Geen club gevonden.</div>;
    }

    return (
        <ClubImagesClient
            clubId={club.id}
            clubName={club.name}
            initialBannerUrl={club.banner_url}
            initialBannerPosition={club.banner_position_y || 20}
        />
    );
}
