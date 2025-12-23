'use server';

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function markBookingAsPaid(bookingId: string) {
    const supabase = createClient();

    // Check Admin
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

    // Update Booking
    const { error } = await supabase
        .from('bookings')
        .update({ payment_status: 'paid' })
        .eq('id', bookingId);

    if (error) {
        console.error("Mark paid error:", error);
        throw new Error("Failed to update payment status");
    }

    revalidatePath('/admin/dashboard');
    return { success: true };
}
