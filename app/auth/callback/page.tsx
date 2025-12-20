import { createClient } from "utils/supabase/server";
import { redirect } from "next/navigation";

export default async function AuthCallback() {
  const supabase = createClient();

  // Exchange auth code for session
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error("Auth callback error:", error.message);
    redirect("/login?message=Authenticatie mislukt, probeer opnieuw in te loggen");
  }

  if (session) {
    redirect("/");
  }

  // Fallback redirect
  redirect("/login");
}
