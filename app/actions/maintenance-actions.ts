'use server';

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function blockCourtForMaintenance(
    courtId: string,
    date: string,
    startTime: string,
    endTime: string,
    reason: string
) {
    const supabase = createClient();

    // 1. Check Auth & Admin Role
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!profile || !['admin', 'super_admin', 'club_owner'].includes(profile.role)) {
        throw new Error("Unauthorized");
    }

    // 2. Create Maintenance Booking
    const { error } = await supabase.from('bookings').insert({
        court_id: courtId,
        user_id: user.id, // Admin creates the block
        club_id: (await getClubId(courtId, supabase)), // Helper to find club
        booking_date: date,
        start_time: startTime,
        end_time: endTime,
        payment_status: 'paid', // Irrelevant for maintenance
        booking_type: 'maintenance',
        title: reason,
        total_price: 0
    });

    if (error) {
        console.error("Maintenance block error:", error);
        throw new Error(`Failed to block court: ${error.message || error.details}`);
    }

    revalidatePath('/admin/dashboard');
    return { success: true };
}

// Helper: Get Club ID from Court (since we need it for booking record)
async function getClubId(courtId: string, supabase: any) {
    const { data } = await supabase.from('courts').select('club_id').eq('id', courtId).single();
    return data?.club_id;
}
