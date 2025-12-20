import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function WalletSuccessPage({
    searchParams,
}: {
    searchParams: { amount?: string };
}) {
    const amount = parseFloat(searchParams.amount || "0");
    const supabase = createClient();

    // Get user
    const { data: { user } } = await supabase.auth.getUser();

    if (user && amount > 0) {
        // Get user's club
        const { data: profile } = await supabase
            .from("user_profiles")
            .select("club_id")
            .eq("id", user.id)
            .single();

        const clubId = profile?.club_id || "90f93d47-b438-427c-8b33-0597817c1d96";

        // Update wallet balance
        const { data: existingWallet } = await supabase
            .from("club_wallets")
            .select("*")
            .eq("user_id", user.id)
            .eq("club_id", clubId)
            .single();

        if (existingWallet) {
            await supabase
                .from("club_wallets")
                .update({ balance: existingWallet.balance + amount })
                .eq("user_id", user.id)
                .eq("club_id", clubId);
        } else {
            await supabase
                .from("club_wallets")
                .insert({
                    user_id: user.id,
                    club_id: clubId,
                    balance: amount,
                });
        }
    }

    return (
        <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-3xl p-8 text-center backdrop-blur-xl">
                <div className="w-20 h-20 bg-green-500/20 border-2 border-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg
                        className="w-10 h-10 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                </div>

                <h1 className="text-3xl font-bold text-white mb-2">
                    Betaling Geslaagd!
                </h1>
                <p className="text-gray-400 mb-6">
                    Je wallet is opgewaardeerd met €{amount.toFixed(2)}
                </p>

                <Link
                    href="/wallet"
                    className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold transition-colors"
                >
                    Terug naar Wallet
                </Link>
            </div>
        </div>
    );
}
