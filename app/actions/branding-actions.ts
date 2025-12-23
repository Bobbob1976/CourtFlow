'use server';

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function setClubBranding(clubId: string, type: 'banner' | 'logo', imageUrl: string) {
    const supabase = createClient();

    const updateData: any = {};
    if (type === 'banner') updateData.banner_url = imageUrl;
    if (type === 'logo') updateData.logo_url = imageUrl;

    const { error } = await supabase
        .from('clubs')
        .update(updateData)
        .eq('id', clubId);

    if (error) throw error;

    revalidatePath('/admin/settings');
    revalidatePath('/admin/images');
    return { success: true };
}

export async function updateBannerPosition(clubId: string, positionY: number) {
    const supabase = createClient();

    // Validate range 0-100
    const pos = Math.max(0, Math.min(100, positionY));

    const { error } = await supabase
        .from('clubs')
        .update({ banner_position_y: pos })
        .eq('id', clubId);

    if (error) throw error;

    revalidatePath('/admin/settings');
    revalidatePath('/admin/images');
    revalidatePath('/dashboard'); // Update dashboard immediately
    return { success: true };
}
