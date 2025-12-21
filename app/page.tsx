import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

export default async function HomePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let nextBooking = null;

  if (user) {
    const { data: bookings } = await supabase
      .from("bookings")
      .select("*, club:clubs(name), court:courts(name)")
      .eq("user_id", user.id)
      .gte("booking_date", new Date().toISOString().split('T')[0])
      .neq("status", "cancelled")
      .order("booking_date", { ascending: true })
      .order("start_time", { ascending: true })
      .limit(1)
      .single();

    if (bookings) {
      // Filter in JS to be sure about time if date is today
      const now = new Date();
      const bookingDateTime = new Date(`${bookings.booking_date}T${bookings.start_time}`);
      if (bookingDateTime > now) {
        nextBooking = bookings;
      }
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#121212] p-8 relative overflow-hidden">
      {/* Rich Background Visual */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-[#121212] to-[#121212] z-0"></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0 mix-blend-overlay"></div>

      {/* Floating Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-600/20 rounded-full blur-[80px] -z-10 animate-pulse delay-1000"></div>

      <div className="text-center relative z-10 max-w-2xl mx-auto">
        <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-6 drop-shadow-2xl">
          Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">CourtFlow</span>
        </h1>
        <p className="mt-4 text-xl text-gray-300 font-light leading-relaxed">
          The premium platform for Padel & Tennis enthusiasts. <br />
          <span className="text-gray-500 text-base">Experience the future of booking.</span>
        </p>

        {/* Next Match Personalization */}
        {nextBooking && (
          <div className="mt-8 p-1 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-400 shadow-[0_0_30px_rgba(37,99,235,0.3)] animate-fade-in-up">
            <div className="bg-[#121212] rounded-xl p-6 flex items-center gap-6">
              <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-xs text-blue-400 font-bold uppercase tracking-wider">Jouw volgende match</p>
                <h3 className="text-white font-bold text-lg">{nextBooking.club.name}</h3>
                <p className="text-gray-400 text-sm">{nextBooking.booking_date} • {nextBooking.start_time.slice(0, 5)}</p>
              </div>
              <div className="ml-auto">
                <Link href="/dashboard" className="text-sm font-bold text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors">
                  Details &rarr;
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="mt-12 flex flex-col items-center gap-6">
          <a href="/demo-club" className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-[#C4FF0D] text-[#0A1628] font-pj rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C4FF0D] hover:scale-105 shadow-[0_0_30px_rgba(196,255,13,0.5)]">
            <div className="absolute -inset-3 rounded-full bg-[#C4FF0D] opacity-20 group-hover:opacity-40 blur-lg transition-opacity duration-200" />
            <span className="text-[#0A1628]">Ga naar Demo Club</span>
            <svg className="w-5 h-5 ml-2 -mr-1 transition-transform group-hover:translate-x-1 text-[#0A1628]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </a>

          <div className="pt-8 space-y-2 opacity-40 hover:opacity-100 transition-opacity text-center">
            <p className="text-xs text-gray-500 font-mono">1. Configure .env.local</p>
            <p className="text-xs text-gray-500 font-mono">2. Run Migrations</p>
            <p className="text-xs text-gray-500 font-mono">3. Start Playing</p>
          </div>
        </div>
      </div>
    </main>
  );
}
