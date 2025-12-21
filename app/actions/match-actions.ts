"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type ScoreState = {
    success?: boolean;
    error?: string;
    matchId?: string;
};

export async function submitMatchScore(prevState: ScoreState, formData: FormData): Promise<ScoreState> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Unauthorized" };
    }

    const bookingId = formData.get("bookingId") as string;
    const team1_p1 = formData.get("team1_p1") as string; // Usually the booker/user
    const team1_p2 = formData.get("team1_p2") as string;
    const team2_p1 = formData.get("team2_p1") as string;
    const team2_p2 = formData.get("team2_p2") as string;

    // Scores
    const s1_t1 = Number(formData.get("s1_t1"));
    const s1_t2 = Number(formData.get("s1_t2"));
    const s2_t1 = Number(formData.get("s2_t1"));
    const s2_t2 = Number(formData.get("s2_t2"));
    const s3_t1 = formData.get("s3_t1") ? Number(formData.get("s3_t1")) : null;
    const s3_t2 = formData.get("s3_t2") ? Number(formData.get("s3_t2")) : null;

    // Validation
    if (!bookingId || !team1_p1 || !team2_p1) {
        return { error: "Missing required fields" };
    }

    // 0. Fetch Booking to get Club ID
    const { data: booking, error: bookingCheckError } = await supabase
        .from("bookings")
        .select("club_id")
        .eq("id", bookingId)
        .single();

    if (bookingCheckError || !booking) {
        console.error("Booking lookup failed:", bookingCheckError);
        return { error: "Booking not found" };
    }

    // 1. Create Match Record
    const { data: match, error: matchError } = await supabase
        .from("matches")
        .insert({
            booking_id: bookingId,
            club_id: booking.club_id, // CRITICAL FIX
            submitted_by: user.id,
            status: "pending_validation",
            score_status: "pending", // Added commonly used field
            date: new Date().toISOString(),
        })
        .select()
        .single();

    if (matchError || !match) {
        console.error("Match creation error:", matchError);
        return { error: "Failed to create match" };
    }

    // 2. Create Match Results
    // Calculate winner
    let t1_sets = 0;
    let t2_sets = 0;
    if (s1_t1 > s1_t2) t1_sets++; else t2_sets++;
    if (s2_t1 > s2_t2) t1_sets++; else t2_sets++;
    if (s3_t1 !== null && s3_t2 !== null) {
        if (s3_t1 > s3_t2) t1_sets++; else t2_sets++;
    }

    const winner_team = t1_sets > t2_sets ? 1 : 2;

    revalidatePath("/bookings");
    return { success: true, matchId: match.id };
}
