'use server';

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

import { sendEmail } from "@/utils/mail";

export async function invitePlayer(bookingId: string, emailStr: string) {
    const email = emailStr.toLowerCase(); // Force lowercase
    const supabase = createClient();

    // 1. Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Niet ingelogd");

    // 2. Check if booking belongs to user AND fetch details for email
    const { data: booking } = await supabase
        .from('bookings')
        .select(`
            user_id, 
            booking_date, 
            start_time,
            club:clubs(name),
            court:courts(name)
        `)
        .eq('id', bookingId)
        .single();

    if (!booking || booking.user_id !== user.id) {
        throw new Error("Je mag alleen mensen uitnodigen voor je eigen boekingen.");
    }

    // Check if already invited
    const { data: existing } = await supabase
        .from('booking_participants')
        .select('id')
        .eq('booking_id', bookingId)
        .eq('email', email)
        .single();

    if (existing) {
        return { success: false, message: "Deze speler is al uitgenodigd." };
    }

    // Insert participant
    const { error } = await supabase.from('booking_participants').insert({
        booking_id: bookingId,
        email: email,
        status: 'pending',
        role: 'player'
    });

    if (error) {
        console.error("Invite error:", error);
        throw new Error("Kon speler niet uitnodigen.");
    }

    // 4. Send Email
    // Note: We don't await this to fail the request if email fails, 
    // but we do log it. Or we await it to be sure. Let's await to be safe.
    try {
        const clubName = (booking.club as any)?.name || 'De Club';
        const courtName = (booking.court as any)?.name || 'De Baan';

        await sendEmail({
            to: email,
            subject: `Uitnodiging voor Padel bij ${clubName}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #0A1628;">🎾 Je bent uitgenodigd!</h2>
                    <p>Hoi,</p>
                    <p>Je bent uitgenodigd voor een potje padel bij <strong>${clubName}</strong>.</p>
                    
                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 5px 0;"><strong>📅 Datum:</strong> ${new Date(booking.booking_date).toLocaleDateString()}</p>
                        <p style="margin: 5px 0;"><strong>⏰ Tijd:</strong> ${booking.start_time.slice(0, 5)}</p>
                        <p style="margin: 5px 0;"><strong>📍 Baan:</strong> ${courtName}</p>
                    </div>

                    <a href="https://courtflow.nl/dashboard" style="display: inline-block; background-color: #C4FF0D; color: #000; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px;">
                        Accepteren op Dashboard
                    </a>
                </div>
            `
        });
    } catch (err) {
        console.error("Failed to send email:", err);
        // Don't throw logic error, just log it. The invite exists in DB.
    }

    revalidatePath(`/bookings/${bookingId}`);
    return { success: true, message: "Uitnodiging verstuurd!" };
}

export async function removeParticipant(participantId: string, bookingId: string) {
    const supabase = createClient();

    // Verify ownership via RLS or explicit check
    const { error } = await supabase
        .from('booking_participants')
        .delete()
        .eq('id', participantId);

    if (error) throw new Error("Kon deelnemer niet verwijderen.");

    revalidatePath(`/bookings/${bookingId}`);
    return { success: true };
}

export async function getIncomingInvites() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !user.email) return [];

    // Fetch invites where email matches OR user_id matches, AND status is pending
    const { data } = await supabase
        .from('booking_participants')
        .select(`
            id, 
            status, 
            booking:bookings (
                id, 
                booking_date, 
                start_time, 
                club:clubs(name, city), 
                court:courts(name)
            )
        `)
        .eq('status', 'pending')
        .or(`email.eq.${user.email},user_id.eq.${user.id}`);

    return data || [];
}

export async function respondToInvite(participantId: string, accept: boolean) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    if (accept) {
        // Update status to accepted AND link user_id if not yet linked
        const { error } = await supabase
            .from('booking_participants')
            .update({
                status: 'accepted',
                user_id: user.id
            })
            .eq('id', participantId);

        if (error) throw new Error(error.message);
    } else {
        // Decline = delete participation? Or set status 'declined'
        // Let's delete for cleanliness, or decline if you want history.
        // Let's delete.
        const { error } = await supabase
            .from('booking_participants')
            .delete()
            .eq('id', participantId);

        if (error) throw new Error(error.message);
    }

    revalidatePath('/dashboard');
    return { success: true };
}
