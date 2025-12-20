import { createClient } from "utils/supabase/server";
import NavbarClient from "./NavbarClient";

export default async function Navbar() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-[#121212]/80 backdrop-blur-xl transition-all duration-300">
      <NavbarClient user={user} />
    </header>
  );
}
