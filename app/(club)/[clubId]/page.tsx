import { createClient } from "@/utils/supabase/server";
import ClubBookingClient from "@/components/booking/ClubBookingClient";

export default async function ClubPage({ params }: { params: { clubId: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("DEBUG: ClubPage params.clubId:", params.clubId);

  // Check if params.clubId is a UUID
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.clubId);
  console.log("DEBUG: isUuid:", isUuid);

  let query = supabase.from("clubs").select("id, subdomain");

  if (isUuid) {
    console.log("DEBUG: Querying by ID");
    query = query.eq("id", params.clubId);
  } else {
    console.log("DEBUG: Querying by subdomain");
    query = query.eq("subdomain", params.clubId);
  }

  const { data: club, error } = await query.single();
  console.log("DEBUG: Club query result:", club, error);

  if (!club) {
    return null; // Layout handles "Club niet gevonden"
  }

  return (
    <div className="py-12 px-4 bg-[#121212] min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Boek je baan</h1>
          <p className="text-gray-400">Kies een tijdstip en speel.</p>
        </div>

        <ClubBookingClient
          clubId={club.id}
          userId={user?.id || ""}
        />
      </div>
    </div>
  );
}
