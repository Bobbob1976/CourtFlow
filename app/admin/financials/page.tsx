import { createClient } from "@/utils/supabase/server";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import TaxBreakdownTable from "@/components/admin/TaxBreakdownTable";
import RevenueChart from "@/components/admin/RevenueChart";

export default async function AdminFinancialsPage() {
    const supabase = createClient();

    // 1. Get Club Context
    const { data: clubs } = await supabase.from('clubs').select('id, name, country').limit(1);
    const club = clubs?.[0];

    if (!club) return <div className="p-8 text-white">Geen club data gevonden.</div>;

    // 2. Fetch bookings to calculate revenue
    const { data: bookings } = await supabase
        .from("bookings")
        .select("total_cost, payment_status, cancelled_at, created_at, date")
        .eq('club_id', club.id)
        .is('cancelled_at', null);

    // 3. Fetch ledger entries
    const { data: entries } = await supabase
        .from("ledger_entries")
        .select("*")
        .eq('club_id', club.id)
        .order("transaction_date", { ascending: false })
        .limit(50);

    // Calculate totals from bookings
    const totalRevenue = bookings?.reduce((sum, b) => sum + (Number(b.total_cost) || 0), 0) || 0;
    const paidRevenue = bookings?.filter(b => b.payment_status === 'paid').reduce((sum, b) => sum + (Number(b.total_cost) || 0), 0) || 0;

    // Calculate from ledger (if exists)
    const totalDebit = entries?.reduce((sum, e) => sum + (Number(e.debit) || 0), 0) || 0;
    const balance = totalRevenue - totalDebit;

    // Create mock entries for tax breakdown based on real bookings
    const taxEntries = bookings?.map(b => ({
        id: Math.random().toString(), // temporary ID for view only
        description: 'Court booking',
        credit: b.total_cost,
        debit: 0,
        transaction_date: b.date || b.created_at
    })) || [];

    return (
        <div className="p-6 space-y-8 max-w-[1600px] mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">Financieel Overzicht</h1>
                    <p className="text-gray-400 text-sm">Real-time inzicht voor {club.name}</p>
                </div>
                <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl text-sm font-bold transition-transform hover:scale-105 shadow-lg shadow-blue-600/20 flex items-center gap-2">
                    <span>📥</span> Download Rapport
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <KPICard
                    title="Totale Omzet"
                    value={`€${totalRevenue.toFixed(2)}`}
                    sub={`${bookings?.length || 0} boekingen`}
                    trend="+12%"
                    color="green"
                />
                <KPICard
                    title="Uitgaven"
                    value={`€${totalDebit.toFixed(2)}`}
                    sub={`${entries?.length || 0} transacties`}
                    trend="+3%"
                    color="red"
                />
                <KPICard
                    title="Netto Winst"
                    value={`€${balance.toFixed(2)}`}
                    sub="Omzet - Uitgaven"
                    trend={balance > 0 ? "+Good" : "-Careful"}
                    color={balance >= 0 ? "blue" : "yellow"}
                />
                <KPICard
                    title="Openstaand"
                    value={`€${(totalRevenue - paidRevenue).toFixed(2)}`}
                    sub="Nog te innen"
                    trend="Actie vereist"
                    color="purple"
                />
            </div>

            {/* Main Revenue Chart */}
            <RevenueChart bookings={bookings || []} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Tax Breakdown Table */}
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-white">BTW Overzicht</h3>
                    <TaxBreakdownTable entries={taxEntries} countryCode={club.country || "NL"} />
                </div>

                {/* Ledger Table */}
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-white">Grootboek Mutaties</h3>
                    <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                        <div className="overflow-x-auto max-h-[400px]">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-white/5 text-gray-400 font-medium uppercase text-xs sticky top-0 bg-[#222]">
                                    <tr>
                                        <th className="px-6 py-4">Datum</th>
                                        <th className="px-6 py-4">Omschrijving</th>
                                        <th className="px-6 py-4 text-right">Debit</th>
                                        <th className="px-6 py-4 text-right">Credit</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {entries?.map((entry) => (
                                        <LedgerRow key={entry.id} entry={entry} />
                                    ))}
                                    {(!entries || entries.length === 0) && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                                Nog geen uitgaven geregistreerd.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Simple internal components for cleaner code
function KPICard({ title, value, sub, trend, color }: any) {
    const colors: any = {
        green: "text-green-400 border-green-500/20 bg-green-500/5",
        red: "text-red-400 border-red-500/20 bg-red-500/5",
        blue: "text-blue-400 border-blue-500/20 bg-blue-500/5",
        yellow: "text-yellow-400 border-yellow-500/20 bg-yellow-500/5",
        purple: "text-purple-400 border-purple-500/20 bg-purple-500/5",
    };

    return (
        <div className={`p-6 rounded-2xl border ${colors[color]} relative group transition-all hover:-translate-y-1`}>
            <p className="text-gray-400 text-xs font-bold uppercase mb-2 tracking-wider flex justify-between">
                {title}
                <span className="opacity-50 group-hover:opacity-100 transition-opacity">{trend}</span>
            </p>
            <p className="text-3xl font-bold text-white mb-1">{value}</p>
            <p className="text-xs opacity-60 font-mono">{sub}</p>
        </div>
    )
}

function LedgerRow({ entry }: { entry: any }) {
    const date = new Date(entry.transaction_date);
    return (
        <tr className="hover:bg-white/5 transition-colors">
            <td className="px-6 py-4 font-mono text-gray-400 text-xs">
                {format(date, "d MMM", { locale: nl })}
            </td>
            <td className="px-6 py-4 text-white font-medium">
                {entry.description}
            </td>
            <td className="px-6 py-4 text-right font-mono text-red-400">
                {entry.debit > 0 ? `-€${Number(entry.debit).toFixed(2)}` : ''}
            </td>
            <td className="px-6 py-4 text-right font-mono text-green-400">
                {entry.credit > 0 ? `+€${Number(entry.credit).toFixed(2)}` : ''}
            </td>
        </tr>
    )
}
