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
    <div className="py-12 px-4 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Modern Hero Header with Glassmorphism & Images */}
        <div className="mb-12 relative">
          {/* Gradient Accent */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-br from-courtflow-orange/20 to-courtflow-green/20 rounded-full blur-3xl opacity-30 pointer-events-none"></div>

          {/* Glass Card Header with Images */}
          <div className="relative glass-card rounded-3xl p-8 md:p-12 border-2 border-white/10 hover:border-courtflow-green/30 transition-all duration-500 overflow-hidden">
            {/* Decorative Padel Images - Floating in background */}
            <div className="absolute -right-20 -top-20 w-80 h-80 opacity-20 rotate-12 pointer-events-none animate-pulse">
              <img
                src="/images/padel/padel_doubles_green.png"
                alt="Padel Action"
                className="w-full h-full object-contain filter drop-shadow-2xl"
              />
            </div>
            <div className="absolute -left-16 -bottom-16 w-64 h-64 opacity-15 -rotate-12 pointer-events-none hidden md:block">
              <img
                src="/images/padel/padel_action_orange.png"
                alt="Padel Serve"
                className="w-full h-full object-contain filter drop-shadow-2xl"
              />
            </div>

            {/* Content */}
            <div className="relative z-10">
              {/* Small badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-courtflow-green/10 border border-courtflow-green/20 rounded-full mb-6">
                <span className="w-2 h-2 bg-courtflow-green rounded-full animate-pulse"></span>
                <span className="text-sm font-medium text-courtflow-green">Live beschikbaarheid</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">
                Boek je&nbsp;
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-courtflow-orange via-courtflow-green to-courtflow-green">
                  baan
                </span>
              </h1>
              <p className="text-xl text-gray-300 font-light max-w-2xl">
                Kies een tijdstip en speel. Direct online reserveren en betalen.
              </p>

              {/* Action Preview Images - Mobile friendly */}
              <div className="flex gap-4 mt-8 overflow-x-auto no-scrollbar pb-4">
                <div className="flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 border-courtflow-green/30 hover:border-courtflow-orange/50 transition-all duration-300 hover:scale-105 cursor-pointer">
                  <img
                    src="/images/padel/padel_smash_yellow.png"
                    alt="Padel Smash"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 border-courtflow-green/30 hover:border-courtflow-orange/50 transition-all duration-300 hover:scale-105 cursor-pointer">
                  <img
                    src="/images/padel/padel_celebration_cyan.png"
                    alt="Padel Celebration"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 border-courtflow-green/30 hover:border-courtflow-orange/50 transition-all duration-300 hover:scale-105 cursor-pointer">
                  <img
                    src="/images/padel/padel_serve_action.png"
                    alt="Padel Serve"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 border-courtflow-green/30 hover:border-courtflow-orange/50 transition-all duration-300 hover:scale-105 cursor-pointer hidden sm:block">
                  <img
                    src="/images/padel/padel_volley_purple.png"
                    alt="Padel Volley"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <ClubBookingClient
          clubId={club.id}
          userId={user?.id || ""}
        />
      </div>
    </div>
  );
}
