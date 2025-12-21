import { createClient } from "utils/supabase/server";
import { redirect } from "next/navigation";
import TopUpForm from "@/components/wallet/TopUpForm";
import { createMollieTopUpPayment } from "@/lib/mollie-actions";

async function topUpAction(formData: FormData) {
  "use server";

  const amount = Number(formData.get("amount"));
  const clubId = formData.get("clubId") as string;

  console.log("🔍 Top-up action called:", { amount, clubId });

  if (!clubId || isNaN(amount) || amount < 5) {
    console.error("❌ Invalid input:", { clubId, amount });
    return { success: false, error: "Ongeldige invoer" };
  }

  // DEVELOPMENT MODE: Skip Mollie and add balance directly (only if no Mollie API key)
  if (process.env.NODE_ENV === 'development' && !process.env.MOLLIE_API_KEY) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: existingWallet } = await supabase
        .from('club_wallets')
        .select('*')
        .eq('user_id', user.id)
        .eq('club_id', clubId)
        .single();

      if (existingWallet) {
        await supabase
          .from('club_wallets')
          .update({ balance: existingWallet.balance + amount })
          .eq('user_id', user.id)
          .eq('club_id', clubId);
      } else {
        await supabase
          .from('club_wallets')
          .insert({
            user_id: user.id,
            club_id: clubId,
            balance: amount
          });
      }

      console.log("✅ DEV MODE: Added €" + amount + " to wallet");
      redirect('/wallet?success=true');
    }
  }

  // PRODUCTION MODE: Use Mollie
  const result = await createMollieTopUpPayment({ clubId, amount });

  if (result.success && result.data?.checkoutUrl) {
    redirect(result.data.checkoutUrl);
  }

  return { success: false, error: result.error || "Top-up mislukt" };
}

export default async function WalletPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("club_id")
    .eq("id", user.id)
    .single();

  const clubId = profile?.club_id || "90f93d47-b438-427c-8b33-0597817c1d96";

  const { data: walletData } = await supabase
    .from("club_wallets")
    .select("balance")
    .eq("user_id", user.id)
    .eq("club_id", clubId)
    .single();

  const wallet = walletData || { balance: 0 };

  return (
    <div className="min-h-screen bg-[#0A1628] py-12 px-4 sm:px-6 lg:px-8 font-sans text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-8">Mijn Portemonnee</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* METAL CARD VISUAL */}
          <div className="relative h-64 rounded-3xl overflow-hidden shadow-2xl transform transition-transform hover:scale-[1.02] duration-300">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black z-0"></div>
            <img
              src="https://images.unsplash.com/photo-1639322537228-ad714dd474f5?q=80&w=2000&auto=format&fit=crop"
              className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay"
            />

            {/* Shine Effect */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none z-10"></div>

            {/* Card Content */}
            <div className="relative z-20 p-8 flex flex-col justify-between h-full">
              <div className="flex justify-between items-start">
                <img src="/logo.webp" className="h-8 opacity-80" alt="CourtFlow" />
                <span className="text-white/60 font-mono tracking-widest text-sm">PREMIUM MEMBER</span>
              </div>

              <div>
                <div className="text-gray-400 text-sm uppercase tracking-wider mb-1">Huidig Saldo</div>
                <div className="text-5xl font-bold text-white tracking-tight flex items-baseline gap-2">
                  €{wallet.balance.toFixed(2)}
                </div>
              </div>

              <div className="flex justify-between items-end">
                <div className="font-mono text-gray-400 tracking-widest text-sm">**** **** **** 4242</div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-gray-500 uppercase">Valid Thru</span>
                  <span className="text-sm font-bold">12/28</span>
                </div>
              </div>
            </div>
          </div>

          {/* TOP UP SECTION */}
          <div className="bg-[#132338] rounded-3xl p-8 border border-white/5">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-[#C4FF0D] text-[#0A1628] flex items-center justify-center text-lg font-bold">+</span>
              Opwaarderen
            </h2>
            <p className="text-gray-400 text-sm mb-6">Kies een bedrag om direct toe te voegen aan je account.</p>

            <div className="space-y-4">
              <TopUpForm clubId={clubId} action={topUpAction} />
            </div>

            {!profile?.club_id && (
              <p className="mt-4 text-xs text-yellow-500/80 text-center">
                ⚠️ Test modus (Demo Club)
              </p>
            )}
          </div>
        </div>

        {/* TRANSACTIONS */}
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-6">Recente Transacties</h2>
          <div className="bg-[#132338] rounded-3xl overflow-hidden border border-white/5">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-6 border-b border-white/5 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${i === 0 ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    {i === 0 ? '+' : '↗'}
                  </div>
                  <div>
                    <div className="font-bold text-white">{i === 0 ? 'Opwaardering' : 'Boeking Baan 3'}</div>
                    <div className="text-xs text-gray-400">Vandaag, 14:30</div>
                  </div>
                </div>
                <div className={`font-bold ${i === 0 ? 'text-green-400' : 'text-white'}`}>
                  {i === 0 ? '+ €50.00' : '- €30.00'}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
