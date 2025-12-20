import { createClient } from "@/utils/supabase/server";
import TaxRateUpdateForm from "@/components/admin/TaxRateUpdateForm";

export default async function AdminTaxSettingsPage() {
    const supabase = createClient();

    // Fetch all active tax rates
    const { data: taxRates } = await supabase
        .from('tax_rates')
        .select('*')
        .is('effective_until', null)
        .order('country_name');

    // Format for the form
    const countries = (taxRates || []).map(rate => ({
        code: rate.country_code,
        name: rate.country_name,
        currentSportRate: parseFloat(rate.sport_rate),
        currentGoodsRate: parseFloat(rate.goods_rate),
        currency: rate.currency,
        sportLabel: rate.sport_label,
        goodsLabel: rate.goods_label
    }));

    // Fetch tax rate history for display
    const { data: history } = await supabase
        .from('tax_rates')
        .select('*')
        .order('effective_from', { ascending: false })
        .limit(20);

    return (
        <div className="p-6 space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">BTW & Belasting Instellingen</h1>
                <p className="text-gray-400">
                    Beheer belastingtarieven voor {countries.length} landen. Plan toekomstige wijzigingen en bekijk historische data.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <p className="text-gray-400 text-xs font-bold uppercase mb-2">Ondersteunde Landen</p>
                    <p className="text-3xl font-bold text-white">{countries.length}</p>
                    <p className="text-xs text-gray-500 mt-1">Wereldwijd actief</p>
                </div>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <p className="text-gray-400 text-xs font-bold uppercase mb-2">Actieve Tarieven</p>
                    <p className="text-3xl font-bold text-green-400">{taxRates?.length || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">Huidig geldig</p>
                </div>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <p className="text-gray-400 text-xs font-bold uppercase mb-2">Historische Records</p>
                    <p className="text-3xl font-bold text-blue-400">{history?.length || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">Laatste 20 wijzigingen</p>
                </div>
            </div>

            {/* Update Form */}
            <TaxRateUpdateForm countries={countries} />

            {/* Current Tax Rates Table */}
            <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-white/10">
                    <h3 className="font-bold text-white text-lg">Huidige Belastingtarieven</h3>
                    <p className="text-xs text-gray-400 mt-1">Actieve tarieven per land</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-gray-400 font-medium uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">Land</th>
                                <th className="px-6 py-4">Code</th>
                                <th className="px-6 py-4">Valuta</th>
                                <th className="px-6 py-4 text-right">Sport Tarief</th>
                                <th className="px-6 py-4 text-right">Goederen Tarief</th>
                                <th className="px-6 py-4">Ingangsdatum</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {countries.map((country) => {
                                const rate = taxRates?.find(r => r.country_code === country.code);
                                return (
                                    <tr key={country.code} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="text-white font-medium">{country.name}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-xs font-bold border border-blue-500/30">
                                                {country.code}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-300 font-mono">
                                            {country.currency}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-green-400 font-bold">
                                                {country.sportLabel}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-blue-400 font-bold">
                                                {country.goodsLabel}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400 font-mono text-xs">
                                            {rate?.effective_from ? new Date(rate.effective_from).toLocaleDateString('nl-NL') : '-'}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Tax Rate History */}
            <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-white/10">
                    <h3 className="font-bold text-white text-lg">Wijzigingsgeschiedenis</h3>
                    <p className="text-xs text-gray-400 mt-1">Laatste 20 belastingwijzigingen</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-gray-400 font-medium uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">Land</th>
                                <th className="px-6 py-4">Ingangsdatum</th>
                                <th className="px-6 py-4">Einddatum</th>
                                <th className="px-6 py-4 text-right">Sport</th>
                                <th className="px-6 py-4 text-right">Goederen</th>
                                <th className="px-6 py-4">Notities</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {history?.map((record) => {
                                const isActive = !record.effective_until;
                                return (
                                    <tr key={record.id} className={`hover:bg-white/5 transition-colors ${isActive ? 'bg-green-500/5' : ''}`}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-white font-medium">{record.country_name}</span>
                                                {isActive && (
                                                    <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-[10px] font-bold border border-green-500/30">
                                                        ACTIEF
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-300 font-mono text-xs">
                                            {new Date(record.effective_from).toLocaleDateString('nl-NL')}
                                        </td>
                                        <td className="px-6 py-4 text-gray-400 font-mono text-xs">
                                            {record.effective_until ? new Date(record.effective_until).toLocaleDateString('nl-NL') : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right text-green-400 font-mono">
                                            {(parseFloat(record.sport_rate) * 100).toFixed(1)}%
                                        </td>
                                        <td className="px-6 py-4 text-right text-blue-400 font-mono">
                                            {(parseFloat(record.goods_rate) * 100).toFixed(1)}%
                                        </td>
                                        <td className="px-6 py-4 text-gray-400 text-xs max-w-xs truncate">
                                            {record.notes || '-'}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
