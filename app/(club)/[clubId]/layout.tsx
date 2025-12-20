import type { ReactNode, CSSProperties } from "react";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/lib/supabase-admin";

export default async function ClubLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { clubId: string };
}) {
  const supabase = createClient();
  // Check if params.clubId is a UUID
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.clubId);

  let query = supabase.from("clubs").select("id, name, brand_color");

  if (isUuid) {
    query = query.eq("id", params.clubId);
  } else {
    query = query.eq("subdomain", params.clubId);
  }

  let { data: club } = await query.single();

  if (params.clubId === "demo") {
    try {
      const adminSupabase = createAdminClient();

      // Ensure club exists with stripe_account_id for wallet demo
      let demoClub = club;
      if (!demoClub) {
        const { data: newClub } = await adminSupabase
          .from("clubs")
          .insert({
            name: "Demo Padel Club",
            subdomain: "demo",
            brand_color: "#3B82F6",
            subscription_tier: "starter",
            stripe_account_id: "acct_test_demo", // Dummy for wallet demo
          })
          .select("id, name, brand_color")
          .single();
        demoClub = newClub;
      } else {
        // Update existing demo club with stripe_account_id
        await adminSupabase
          .from("clubs")
          .update({ stripe_account_id: "acct_test_demo" })
          .eq("subdomain", "demo");
      }
      club = demoClub;

      // Delete existing courts and re-insert to ensure clean state
      await adminSupabase
        .from("courts")
        .delete()
        .eq("club_id", club.id);

      await adminSupabase.from("courts").insert([
        {
          club_id: club.id,
          name: "Baan 1",
          court_type: "padel",
          hourly_rate: 25.00,
          capacity: 4,
        },
        {
          club_id: club.id,
          name: "Baan 2",
          court_type: "padel",
          hourly_rate: 25.00,
          capacity: 4,
        },
      ]);

      // Auto-set logged-in user's profile club_id to demo for wallet testing
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await adminSupabase
          .from("user_profiles")
          .upsert({
            id: user.id,
            club_id: club.id,
          });
      }
    } catch (error) {
      console.error("Failed to setup demo club/courts/profile:", error);
    }
  }

  if (!club) {
    return <div>Club niet gevonden</div>;
  }

  return (
    <div className="min-h-screen" style={{ '--club-color': club.brand_color! } as CSSProperties}>
      <header className="bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold" style={{ color: club.brand_color }}>
            {club.name}
          </h1>
          <nav className="space-x-4">
            <a href="/" className="hover:text-gray-300">Home</a>
          </nav>
        </div>
      </header>
      <main className="club-content">{children}</main>
    </div>
  );
}
