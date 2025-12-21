import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import HumanDashboard from "@/components/dashboard/HumanDashboard";

export default async function DashboardPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    return <HumanDashboard />;
}
