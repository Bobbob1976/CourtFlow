import { createClient } from "utils/supabase/server";
import NavbarClient from "./NavbarClient";

export default async function Navbar() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userRole = null;
  if (user) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    userRole = profile?.role;
  }

  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-[#121212]/80 backdrop-blur-xl transition-all duration-300">
      <NavbarClient user={user} userRole={userRole} />
    </header>
  );
}
