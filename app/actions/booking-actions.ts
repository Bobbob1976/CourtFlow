'use server';

import { createClient } from "@/utils/supabase/server";
import { sendEmail } from "@/utils/mail";
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

    // 1. Get User
    const { data: { user } } = await supabase.auth.getUser();
    let userId = user?.id;

    if (!userId) {
        return { success: false, error: "Log in om te boeken." };
    }

    // 2. Calculate End Time
    const endTime = calculateEndTime(data.startTime, data.duration);

    // 3. Check Availability (Prevent Double Booking)
    const { data: existingBookings } = await supabase
        .from('bookings')
        .select('start_time, end_time')
        .eq('court_id', data.courtId)
        .eq('booking_date', data.date)
        .is('cancelled_at', null);

    if (existingBookings) {
        const [newStartH, newStartM] = data.startTime.split(':').map(Number);
        const [newEndH, newEndM] = endTime.split(':').map(Number);
        const newStartMins = newStartH * 60 + newStartM;
        const newEndMins = newEndH * 60 + newEndM;

        for (const booking of existingBookings) {
            const [bStartH, bStartM] = booking.start_time.split(':').map(Number);
            const [bEndH, bEndM] = booking.end_time.split(':').map(Number);

            const bStartMins = bStartH * 60 + bStartM;
            const bEndMins = bEndH * 60 + bEndM;

            // Check overlap: newStart < oldEnd AND newEnd > oldStart
            if (newStartMins < bEndMins && newEndMins > bStartMins) {
                return { success: false, error: 'Helaas, dit tijdslot is zojuist bezet.' };
            }
        }
    }

    // 4. Insert Booking
    const { data: booking, error } = await supabase
        .from('bookings')
        .insert({
            club_id: data.clubId,
            court_id: data.courtId,
            user_id: userId,
            booking_date: data.date,
            start_time: data.startTime,
            end_time: endTime,
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

    // 5. Insert Ledger Entry (Revenue)
    await supabase.from('ledger_entries').insert({
        club_id: data.clubId,
        description: `Boeking ${booking.id.substring(0, 8)}`,
        amount: data.price,
        credit: data.price,
        debit: 0,
        transaction_date: data.date,
        category: 'revenue',
        status: 'completed'
    });

    // 6. Fetch details for email
    const { data: details } = await supabase
        .from('bookings')
        .select(`
            club:clubs(name),
            court:courts(name)
        `)
        .eq('id', booking.id)
        .single();

    // 7. Send Email
    if (user.email) {
        try {
            const clubName = (details?.club as any)?.name || 'De Club';
            const courtName = (details?.court as any)?.name || 'De Baan';

            await sendEmail({
                to: user.email,
                subject: `Bevestiging: Je boeking bij ${clubName}`,
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                        <h2 style="color: #0A1628;">✅ Boeking Bevestigd!</h2>
                        <p>Hoi,</p>
                        <p>Bedankt voor je boeking bij <strong>${clubName}</strong>. Hier zijn de details:</p>
                        
                        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <p style="margin: 5px 0;"><strong>📅 Datum:</strong> ${new Date(data.date).toLocaleDateString()}</p>
                            <p style="margin: 5px 0;"><strong>⏰ Tijd:</strong> ${data.startTime}</p>
                            <p style="margin: 5px 0;"><strong>📍 Baan:</strong> ${courtName}</p>
                            <p style="margin: 5px 0;"><strong>💰 Prijs:</strong> €${data.price}</p>
                        </div>

                        <a href="https://courtflow.nl/dashboard" style="display: inline-block; background-color: #0A1628; color: #fff; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px;">
                            Naar mijn Dashboard
                        </a>
                    </div>
                `
            });
        } catch (e) {
            console.error("Mail send failed", e);
        }
    }

    revalidatePath(`/dashboard`);

    return { success: true, bookingId: booking.id };
}

function calculateEndTime(startTime: string, durationMinutes: number): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMinutes = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
}
