'use server';

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function cancelBooking(bookingId: string) {
    const supabase = createClient();

    // 1. Verify Authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        throw new Error("Unauthorized");
    }

    // 2. Cancel the booking
    const { error } = await supabase
        .from('bookings')
        .update({ cancelled_at: new Date().toISOString() })
        .eq('id', bookingId);

    if (error) {
        console.error("Cancel error:", error);
        throw new Error("Failed to cancel booking");
    }

    // 3. Revalidate path to update UI immediately
    revalidatePath('/admin/dashboard');
    revalidatePath('/bookings');

    return { success: true };
}
