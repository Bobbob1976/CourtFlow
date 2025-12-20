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
      // Check if wallet exists
      const { data: existingWallet } = await supabase
        .from('club_wallets')
        .select('*')
        .eq('user_id', user.id)
        .eq('club_id', clubId)
        .single();

      if (existingWallet) {
        // Update existing wallet
        await supabase
          .from('club_wallets')
          .update({ balance: existingWallet.balance + amount })
          .eq('user_id', user.id)
          .eq('club_id', clubId);
      } else {
        // Create new wallet
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

  console.log("💰 Mollie payment result:", result);

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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Toegang geweigerd
          </h2>
          <p className="mt-2 text-gray-600">
            Je moet ingelogd zijn om je wallet te bekijken.
          </p>
          <a
            href="/login"
            className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Inloggen
          </a>
        </div>
      </div>
    );
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("club_id")
    .eq("id", user.id)
    .single();

  // Use profile club_id or fallback to demo club
  const clubId = profile?.club_id || "90f93d47-b438-427c-8b33-0597817c1d96";

  const { data: walletData } = await supabase
    .from("club_wallets")
    .select("balance")
    .eq("user_id", user.id)
    .eq("club_id", clubId)
    .single();

  const wallet = walletData || { balance: 0 };

  return (
    <div className="min-h-screen bg-[#121212] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white/5 shadow-2xl shadow-black/20 rounded-3xl p-6 border border-white/10 backdrop-blur-xl">
          <h1 className="text-3xl font-bold text-white mb-6">Mijn Wallet</h1>

          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-2xl p-6 mb-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-blue-500/30 transition-all"></div>

            <div className="flex items-center justify-between relative z-10">
              <div>
                <h3 className="text-lg font-medium text-blue-300">
                  Beschikbaar saldo
                </h3>
                <p className="text-4xl font-bold text-white mt-2 shadow-blue-500/50 drop-shadow-sm">
                  €{wallet.balance.toFixed(2)}
                </p>
              </div>
              <div className="text-blue-400 bg-blue-500/10 p-3 rounded-xl border border-blue-500/20">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-white/10 bg-white/5 rounded-2xl p-6 hover:bg-white/10 transition-colors">
              <h3 className="text-lg font-bold text-white mb-2">
                Geld toevoegen
              </h3>
              <p className="text-gray-400 mb-4 text-sm">
                Voeg geld toe aan je wallet voor snelle betalingen.
              </p>
              {!profile?.club_id && (
                <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                  <p className="text-yellow-400 text-xs">
                    ⚠️ Geen club gevonden. Gebruik demo club voor testen.
                  </p>
                </div>
              )}
              <TopUpForm clubId={profile?.club_id || "90f93d47-b438-427c-8b33-0597817c1d96"} action={topUpAction} />
            </div>

            <div className="border border-white/10 bg-white/5 rounded-2xl p-6 hover:bg-white/10 transition-colors">
              <h3 className="text-lg font-bold text-white mb-2">
                Transactiegeschiedenis
              </h3>
              <p className="text-gray-400 mb-4 text-sm">
                Bekijk je recente betalingen en stortingen.
              </p>
              <button className="w-full bg-white/10 text-white py-3 px-4 rounded-xl hover:bg-white/20 font-medium transition-all border border-white/10">
                Bekijken
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
