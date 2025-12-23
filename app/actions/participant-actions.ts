'use server';

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function invitePlayer(bookingId: string, email: string) {
    const supabase = createClient();

    // 1. Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Niet ingelogd");

    // 2. Check if booking belongs to user
    const { data: booking } = await supabase
        .from('bookings')
        .select('user_id')
        .eq('id', bookingId)
        .single();

    if (!booking || booking.user_id !== user.id) {
        throw new Error("Je mag alleen mensen uitnodigen voor je eigen boekingen.");
    }

    // 3. Find if invited user exists in our system
    // We search profiles (assuming we have access, or use RPC if restricted)
    // For now we'll try to find a profile via email if public/accessible, 
    // otherwise we just store the email.
    // NOTE: Default RLS often hides other emails. We'll store email in 'email' column regardless.

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

    // 4. Try to find user_id (Optional enhancement: needs admin privilege or specific RPC to search users by email securely)
    // For MVP we just insert the email. If the user logs in with that email later, we can link them up.

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
