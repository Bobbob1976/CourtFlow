'use server';

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export interface MatchScores {
    set1?: [number, number];
    set2?: [number, number];
    set3?: [number, number];
    winner: 'team1' | 'team2' | 'draw';
}

export async function saveMatchResult(bookingId: string, scores: MatchScores) {
    const supabase = createClient();

    // Gets current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase.from('match_results').upsert({
        booking_id: bookingId,
        created_by: user.id,
        set1_team1: scores.set1?.[0] || 0,
        set1_team2: scores.set1?.[1] || 0,
        set2_team1: scores.set2?.[0] || 0,
        set2_team2: scores.set2?.[1] || 0,
        set3_team1: scores.set3?.[0] || 0,
        set3_team2: scores.set3?.[1] || 0,
        winner_team: scores.winner
    }, { onConflict: 'booking_id' });

    if (error) {
        console.error("Save result error:", error);
        throw new Error(`Uitslag opslaan mislukt: ${error.message}`);
    }

    // --- GAMIFICATION: AWARD XP ---
    try {
        // 1. Get booking owner (assuming Booker is ALWAYS Team 1 for MVP)
        const { data: booking } = await supabase
            .from('bookings')
            .select('user_id')
            .eq('id', bookingId)
            .single();

        if (booking && booking.user_id) {
            let xpEarned = 50; // Participation base

            // Win Bonus
            if (scores.winner === 'team1') xpEarned = 150;
            if (scores.winner === 'draw') xpEarned = 75;

            // Update User Profile
            // Get current XP first to calc level
            const { data: profile } = await supabase.from('user_profiles').select('xp').eq('id', booking.user_id).single();
            const currentXP = profile?.xp || 0;
            const newXP = currentXP + xpEarned;

            // Level Formula: Level 1 = 0-500, Level 2 = 501-1000, etc.
            const newLevel = Math.floor(newXP / 500) + 1;

            await supabase.from('user_profiles').update({
                xp: newXP,
                level: newLevel
            }).eq('id', booking.user_id);

            console.log(`🎮 XP Awarded: +${xpEarned} to user ${booking.user_id}. New Level: ${newLevel}`);
        }
    } catch (xpError) {
        console.error("XP Error (non-blocking):", xpError);
        // Don't fail the request if XP fails, match result is more important
    }

    revalidatePath('/dashboard');
    return { success: true };
}
