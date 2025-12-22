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
    revalidatePath('/'); // Clear cache

    return { success: true };
}

export async function moveBooking(bookingId: string, newStartTime: string, date: string) {
    const supabase = createClient();

    // 1. Get current booking to know duration
    const { data: currentBooking, error: fetchError } = await supabase
        .from('bookings')
        .select('start_time, end_time')
        .eq('id', bookingId)
        .single();

    if (fetchError || !currentBooking) {
        throw new Error("Boeking niet gevonden");
    }

    // 2. Calculate new End Time
    // We assume simple shift based on duration
    const [startH, startM] = currentBooking.start_time.split(':').map(Number);
    const [endH, endM] = currentBooking.end_time.split(':').map(Number);
    const durationMinutes = (endH * 60 + endM) - (startH * 60 + startM);

    const [newH, newM] = newStartTime.split(':').map(Number);
    const newStartMinutes = newH * 60 + newM;
    const newEndMinutes = newStartMinutes + durationMinutes;

    const finalEndH = Math.floor(newEndMinutes / 60) % 24;
    const finalEndM = newEndMinutes % 60;

    const formattedEndTime = `${finalEndH.toString().padStart(2, '0')}:${finalEndM.toString().padStart(2, '0')}`;

    // 3. Update Booking
    const { error } = await supabase
        .from('bookings')
        .update({
            start_time: newStartTime,
            end_time: formattedEndTime,
            booking_date: date // Allow moving to another date too
        })
        .eq('id', bookingId);

    if (error) {
        console.error("Move Error:", error);
        throw new Error("Kon boeking niet verplaatsen");
    }

    revalidatePath('/admin/dashboard');
    return { success: true };
}
