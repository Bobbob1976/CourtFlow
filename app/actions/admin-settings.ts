'use server';

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateSettings(formData: FormData) {
    const supabase = createClient();

    // We assume there's only 1 club for now or fetch based on user session context in real app
    const { data: clubs } = await supabase.from("clubs").select("id").limit(1);
    const club = clubs?.[0];

    if (!club) throw new Error("No club found");

    const name = formData.get("name") as string;
    const subdomain = formData.get("subdomain") as string;

    // Branding fields
    const banner_url = formData.get("banner_url") as string;
    const logo_url = formData.get("logo_url") as string;
    const primary_color = formData.get("primary_color") as string;

    await supabase
        .from("clubs")
        .update({
            name,
            subdomain,
            banner_url: banner_url || null,
            logo_url: logo_url || null,
            primary_color: primary_color || '#C4FF0D'
        })
        .eq("id", club.id);

    revalidatePath("/admin/settings");
    revalidatePath(`/club/${subdomain}`); // Revalidate booking pages if possible
}
