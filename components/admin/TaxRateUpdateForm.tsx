"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

interface TaxRateUpdateFormProps {
    countries: Array<{ code: string; name: string; currentSportRate: number; currentGoodsRate: number }>;
}

export default function TaxRateUpdateForm({ countries }: TaxRateUpdateFormProps) {
    const [selectedCountry, setSelectedCountry] = useState('');
    const [effectiveDate, setEffectiveDate] = useState('');
    const [sportRate, setSportRate] = useState('');
    const [goodsRate, setGoodsRate] = useState('');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const supabase = createClient();

    const handleCountryChange = (code: string) => {
        setSelectedCountry(code);
        const country = countries.find(c => c.code === code);
        if (country) {
            setSportRate((country.currentSportRate * 100).toFixed(2));
            setGoodsRate((country.currentGoodsRate * 100).toFixed(2));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage(null);

        try {
            // Convert percentages to decimals
            const sportRateDecimal = parseFloat(sportRate) / 100;
            const goodsRateDecimal = parseFloat(goodsRate) / 100;

            // Call the database function to add new tax rate
            const { data, error } = await supabase.rpc('add_tax_rate_update', {
                p_country_code: selectedCountry,
                p_effective_from: effectiveDate,
                p_sport_rate: sportRateDecimal,
                p_goods_rate: goodsRateDecimal,
                p_notes: notes || null
            });

            if (error) throw error;

            setMessage({
                type: 'success',
                text: `BTW tarief succesvol bijgewerkt voor ${countries.find(c => c.code === selectedCountry)?.name}. Effectief vanaf ${effectiveDate}.`
            });

            // Reset form
            setSelectedCountry('');
            setEffectiveDate('');
            setSportRate('');
            setGoodsRate('');
            setNotes('');
        } catch (error: any) {
            console.error('Error updating tax rate:', error);
            setMessage({
                type: 'error',
                text: `Fout bij updaten: ${error.message}`
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-8">
            <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-2">BTW Tarief Updaten</h3>
                <p className="text-sm text-gray-400">
                    Plan een toekomstige BTW wijziging. Het oude tarief wordt automatisch afgesloten.
                </p>
            </div>

            {message && (
                <div className={`mb-6 p-4 rounded-xl border ${message.type === 'success'
                        ? 'bg-green-500/10 border-green-500/30 text-green-400'
                        : 'bg-red-500/10 border-red-500/30 text-red-400'
                    }`}>
                    <p className="text-sm font-medium">{message.text}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Country Selection */}
                <div>
                    <label className="block text-sm font-bold text-white mb-2">
                        Land
                    </label>
                    <select
                        value={selectedCountry}
                        onChange={(e) => handleCountryChange(e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    >
                        <option value="">Selecteer een land...</option>
                        {countries.map(country => (
                            <option key={country.code} value={country.code}>
                                {country.name} (Huidig: Sport {(country.currentSportRate * 100).toFixed(1)}% / Goederen {(country.currentGoodsRate * 100).toFixed(1)}%)
                            </option>
                        ))}
                    </select>
                </div>

                {/* Effective Date */}
                <div>
                    <label className="block text-sm font-bold text-white mb-2">
                        Ingangsdatum
                    </label>
                    <input
                        type="date"
                        value={effectiveDate}
                        onChange={(e) => setEffectiveDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        Vanaf deze datum wordt het nieuwe tarief gebruikt
                    </p>
                </div>

                {/* Tax Rates */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-white mb-2">
                            Sport Tarief (%)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={sportRate}
                            onChange={(e) => setSportRate(e.target.value)}
                            required
                            placeholder="9.00"
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-white mb-2">
                            Goederen Tarief (%)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={goodsRate}
                            onChange={(e) => setGoodsRate(e.target.value)}
                            required
                            placeholder="21.00"
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Notes */}
                <div>
                    <label className="block text-sm font-bold text-white mb-2">
                        Notities (optioneel)
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        placeholder="Bijv: BTW verhoogd volgens regeringsbesluit 2026..."
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isSubmitting ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                            Updaten...
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            Tarief Toevoegen
                        </>
                    )}
                </button>
            </form>

            {/* Info Box */}
            <div className="mt-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <div className="flex gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                    </svg>
                    <div className="text-xs text-blue-300 space-y-1">
                        <p className="font-bold">Hoe werkt het?</p>
                        <ul className="list-disc list-inside space-y-1 text-blue-400">
                            <li>Het oude tarief wordt automatisch afgesloten op de dag vóór de ingangsdatum</li>
                            <li>Het nieuwe tarief wordt actief vanaf de gekozen ingangsdatum</li>
                            <li>Historische transacties behouden hun originele BTW-tarief</li>
                            <li>Nieuwe transacties gebruiken automatisch het actieve tarief</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
