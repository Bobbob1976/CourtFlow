import { createClient } from "@/utils/supabase/server";
import { calculateNewRatings, MatchData, Player } from "@/utils/game-engine";
import { NextResponse } from "next/server";

export async function GET() {
    const supabase = createClient();

    try {
        // 1. Create/Get Dummy Users
        const users = [];
        for (let i = 1; i <= 4; i++) {
            const email = `player${i}@test.com`;
            // Try to find existing user profile or create a fake one for testing
            // Since we can't easily create auth users, we'll check if profiles exist or insert them directly if RLS allows, 
            // or just use existing users if possible. 
            // For this simulation, let's assume we have some users or we just insert into user_profiles if it's not linked strictly to auth.users for this test.
            // Actually, user_profiles usually references auth.users. 
            // Let's just use random UUIDs and insert into player_ratings directly for the math test.
            users.push({ id: crypto.randomUUID(), name: `Player ${i}`, rating: 2.50 });
        }

        // 2. Setup Match Data
        const matchData: MatchData = {
            team1: [
                { id: users[0].id, rating: users[0].rating, matchesPlayed: 0 },
                { id: users[1].id, rating: users[1].rating, matchesPlayed: 0 }
            ],
            team2: [
                { id: users[2].id, rating: users[2].rating, matchesPlayed: 0 },
                { id: users[3].id, rating: users[3].rating, matchesPlayed: 0 }
            ],
            scores: [[6, 0], [6, 1]] // Total destruction by Team 1
        };

        // 3. Run Algorithm
        const updates = calculateNewRatings(matchData);

        // 4. Apply Updates to DB (Simulation)
        // We will upsert into player_ratings
        const results = [];
        for (const update of updates) {
            const { error } = await supabase
                .from('player_ratings')
                .upsert({
                    user_id: update.playerId,
                    current_rating: update.newRating,
                    matches_played: 1,
                    last_active: new Date().toISOString()
                });

            results.push({ ...update, dbError: error });
        }

        return NextResponse.json({
            message: "Simulation Complete",
            match: "Team 1 (2.50) vs Team 2 (2.50) - Score: 6-0, 6-1",
            updates: results
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
