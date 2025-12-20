import { createClient } from "@/utils/supabase/server";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import TaxBreakdownTable from "@/components/admin/TaxBreakdownTable";

export default async function AdminFinancialsPage() {
    const supabase = createClient();

    // Fetch bookings to calculate revenue
    const { data: bookings } = await supabase
        .from("bookings")
        .select("total_cost, payment_status, cancelled_at")
        .eq('club_id', '90f93d47-b438-427c-8b33-0597817c1d96')
        .is('cancelled_at', null);

    // Fetch ledger entries
    const { data: entries } = await supabase
        .from("ledger_entries")
        .select("*")
        .eq('club_id', '90f93d47-b438-427c-8b33-0597817c1d96')
        .order("transaction_date", { ascending: false })
        .limit(50);

    // Calculate totals from bookings
    const totalRevenue = bookings?.reduce((sum, b) => sum + (Number(b.total_cost) || 0), 0) || 0;
    const paidRevenue = bookings?.filter(b => b.payment_status === 'paid').reduce((sum, b) => sum + (Number(b.total_cost) || 0), 0) || 0;
    const pendingRevenue = totalRevenue - paidRevenue;

    // Calculate from ledger (if exists)
    const totalDebit = entries?.reduce((sum, e) => sum + (Number(e.debit) || 0), 0) || 0;
    const totalCredit = entries?.reduce((sum, e) => sum + (Number(e.credit) || 0), 0) || 0;
    const balance = totalRevenue - totalDebit; // Revenue minus expenses

    // Create mock entries for tax breakdown (from bookings)
    const taxEntries = bookings?.map(b => ({
        id: Math.random().toString(),
        description: 'Court booking',
        credit: b.total_cost,
        debit: 0,
        transaction_date: new Date().toISOString()
    })) || [];

    return (
        <div className="p-6 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">Financial Overview</h1>
                <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                    Download Report
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <p className="text-gray-400 text-xs font-bold uppercase mb-2">Total Revenue (All Bookings)</p>
                    <p className="text-3xl font-bold text-green-400">€{totalRevenue.toFixed(2)}</p>
                    <p className="text-xs text-gray-500 mt-1">{bookings?.length || 0} bookings</p>
                </div>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <p className="text-gray-400 text-xs font-bold uppercase mb-2">Total Expenses (Debit)</p>
                    <p className="text-3xl font-bold text-red-400">€{totalDebit.toFixed(2)}</p>
                    <p className="text-xs text-gray-500 mt-1">{entries?.length || 0} transactions</p>
                </div>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <p className="text-gray-400 text-xs font-bold uppercase mb-2">Net Balance</p>
                    <p className={`text-3xl font-bold ${balance >= 0 ? 'text-blue-400' : 'text-yellow-400'}`}>
                        €{balance.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Revenue - Expenses</p>
                </div>
            </div>

            {/* Tax Breakdown Table - AUDIT READY & INTERNATIONAL */}
            {/* TODO: Fetch countryCode from club settings in database */}
            <TaxBreakdownTable entries={taxEntries} countryCode="NL" />

            {/* Ledger Table */}
            <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-white/10">
                    <h3 className="font-bold text-white">General Ledger</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-gray-400 font-medium uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Description</th>
                                <th className="px-6 py-4">Account</th>
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
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        No transactions recorded yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function LedgerRow({ entry }: { entry: any }) {
    const date = new Date(entry.transaction_date);

    return (
        <tr className="hover:bg-white/5 transition-colors">
            <td className="px-6 py-4 font-mono text-gray-400 text-xs">
                {format(date, "d MMM yyyy HH:mm", { locale: nl })}
            </td>
            <td className="px-6 py-4 text-white font-medium">
                {entry.description}
            </td>
            <td className="px-6 py-4">
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-white/5 text-gray-400 border border-white/10">
                    {entry.account_code || 'GEN'}
                </span>
            </td>
            <td className="px-6 py-4 text-right font-mono text-red-400">
                {entry.debit > 0 ? `-€${Number(entry.debit).toFixed(2)}` : '-'}
            </td>
            <td className="px-6 py-4 text-right font-mono text-green-400">
                {entry.credit > 0 ? `+€${Number(entry.credit).toFixed(2)}` : '-'}
            </td>
        </tr>
    )
}
