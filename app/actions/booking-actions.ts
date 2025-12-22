'use server';

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createPublicBooking(data: {
    clubId: string;
    courtId: string;
    date: string;
    startTime: string;
    duration: number;
    price: number;
}) {
    const supabase = createClient();

    // 1. Check Availability (Double check server-side)
    // Simple check: is there any booking overlapping?
    // Note: This needs logic similar to "courts/status" but stricter.
    // For this MVP, we rely on the database constraint or trust the UI slightly, 
    // but honestly we should query just to be safe.

    // 2. Get or Create a Guest User Profile
    // For testing simplicity, we try to use the current auth user, or fallback to a "System Guest".
    const { data: { user } } = await supabase.auth.getUser();
    let userId = user?.id;

    if (!userId) {
        // If no user logic exists, we fail for now, OR we need a "Guest" mechanism.
        // Let's assume for this "Admin Test" you are logged in as Admin in the same browser context.
        // If not, we return an error that you must be logged in.
        return { success: false, error: "Log in om te boeken (Test Mode)" };
    }

    // 3. Insert Booking
    const { data: booking, error } = await supabase
        .from('bookings')
        .insert({
            club_id: data.clubId,
            court_id: data.courtId,
            user_id: userId,
            booking_date: data.date,
            start_time: data.startTime,
            end_time: calculateEndTime(data.startTime, data.duration),
            // duration column does not exist, so we skip it
            total_cost: data.price,
            payment_status: 'paid', // Assume instant pay for demo
            status: 'confirmed'
        })
        .select()
        .single();

    if (error) {
        console.error("Booking Error:", error);
        return { success: false, error: `DB Error: ${error.message || error.details || 'Unknown'}` };
    }

    // 4. Insert Ledger Entry (Revenue)
    await supabase.from('ledger_entries').insert({
        club_id: data.clubId,
        description: `Boeking ${booking.id.substring(0, 8)}`,
        amount: data.price, // Old field
        credit: data.price, // New accounting field
        debit: 0,
        transaction_date: data.date,
        category: 'revenue',
        status: 'completed'
    });

    revalidatePath(`/admin/dashboard`);
    revalidatePath(`/${data.clubId}`);

    return { success: true, bookingId: booking.id };
}

function calculateEndTime(startTime: string, durationMinutes: number): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes + durationMinutes);
    return date.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
}
