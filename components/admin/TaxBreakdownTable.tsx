"use client";

import { useState } from "react";
import { getTaxConfig, formatCurrency } from "@/lib/tax-config";

interface TaxBreakdownProps {
    entries: any[];
    countryCode?: string; // ISO country code (NL, BE, DE, FR, ES, UK, US, etc.)
}

interface TaxSummary {
    category: string;
    revenueExcl: number;
    vatSport: number;   // Sport/services VAT
    vatGoods: number;   // Goods VAT
    totalIncl: number;
}

export default function TaxBreakdownTable({ entries, countryCode = 'NL' }: TaxBreakdownProps) {
    const [isExporting, setIsExporting] = useState(false);
    const taxConfig = getTaxConfig(countryCode);

    // Calculate tax breakdown by category
    const calculateBreakdown = (): TaxSummary[] => {
        const categories: { [key: string]: TaxSummary } = {
            'Court Rental': { category: 'Baanhuur', revenueExcl: 0, vatSport: 0, vatGoods: 0, totalIncl: 0 },
            'Lessons': { category: 'Lessen', revenueExcl: 0, vatSport: 0, vatGoods: 0, totalIncl: 0 },
            'Shop': { category: 'Winkel', revenueExcl: 0, vatSport: 0, vatGoods: 0, totalIncl: 0 },
            'Other': { category: 'Overig', revenueExcl: 0, vatSport: 0, vatGoods: 0, totalIncl: 0 },
        };

        entries?.forEach(entry => {
            if (!entry.credit || entry.credit <= 0) return;

            // Determine category from description
            let categoryKey = 'Other';
            if (entry.description?.toLowerCase().includes('booking') || entry.description?.toLowerCase().includes('court')) {
                categoryKey = 'Court Rental';
            } else if (entry.description?.toLowerCase().includes('lesson')) {
                categoryKey = 'Lessons';
            } else if (entry.description?.toLowerCase().includes('shop') || entry.description?.toLowerCase().includes('product')) {
                categoryKey = 'Shop';
            }

            const amount = Number(entry.credit);

            // Use country-specific VAT rates
            const vatRate = (categoryKey === 'Court Rental' || categoryKey === 'Lessons')
                ? taxConfig.sportRate
                : taxConfig.goodsRate;

            const revenueExcl = amount / (1 + vatRate);
            const vat = amount - revenueExcl;

            categories[categoryKey].revenueExcl += revenueExcl;
            categories[categoryKey].totalIncl += amount;

            // Assign to correct VAT column
            if (categoryKey === 'Court Rental' || categoryKey === 'Lessons') {
                categories[categoryKey].vatSport += vat;
            } else {
                categories[categoryKey].vatGoods += vat;
            }
        });

        return Object.values(categories).filter(cat => cat.totalIncl > 0);
    };

    const breakdown = calculateBreakdown();

    // Calculate totals
    const totals = breakdown.reduce((acc, item) => ({
        revenueExcl: acc.revenueExcl + item.revenueExcl,
        vatSport: acc.vatSport + item.vatSport,
        vatGoods: acc.vatGoods + item.vatGoods,
        totalIncl: acc.totalIncl + item.totalIncl,
    }), { revenueExcl: 0, vatSport: 0, vatGoods: 0, totalIncl: 0 });

    const exportToCSV = () => {
        setIsExporting(true);

        // Create CSV content with dynamic headers
        const headers = ['Categorie', 'Omzet Excl.', taxConfig.sportLabel, taxConfig.goodsLabel, 'Totaal Incl.'];
        const rows = breakdown.map(item => [
            item.category,
            formatCurrency(item.revenueExcl, countryCode),
            formatCurrency(item.vatSport, countryCode),
            formatCurrency(item.vatGoods, countryCode),
            formatCurrency(item.totalIncl, countryCode)
        ]);

        // Add totals row
        rows.push([
            'TOTAAL',
            formatCurrency(totals.revenueExcl, countryCode),
            formatCurrency(totals.vatSport, countryCode),
            formatCurrency(totals.vatGoods, countryCode),
            formatCurrency(totals.totalIncl, countryCode)
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        // Create download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `tax-breakdown-${countryCode}-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => setIsExporting(false), 1000);
    };

    return (
        <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-white text-lg">BTW Overzicht</h3>
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold border border-blue-500/30">
                            {taxConfig.country}
                        </span>
                    </div>
                    <p className="text-xs text-gray-400">Gesplitst per categorie en BTW-tarief</p>
                </div>
                <button
                    onClick={exportToCSV}
                    disabled={isExporting}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isExporting ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                            Exporteren...
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                            </svg>
                            Export CSV voor Accountant
                        </>
                    )}
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 text-gray-400 font-medium uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4">Categorie</th>
                            <th className="px-6 py-4 text-right">Omzet Excl.</th>
                            <th className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-1">
                                    {taxConfig.sportLabel}
                                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-green-500/20 text-green-400 font-bold">Sport</span>
                                </div>
                            </th>
                            <th className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-1">
                                    {taxConfig.goodsLabel}
                                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-400 font-bold">Goederen</span>
                                </div>
                            </th>
                            <th className="px-6 py-4 text-right">Totaal Incl.</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {breakdown.length > 0 ? (
                            <>
                                {breakdown.map((item, index) => (
                                    <tr key={index} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-white font-medium">{item.category}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono text-gray-300">
                                            {formatCurrency(item.revenueExcl, countryCode)}
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono text-green-400">
                                            {item.vatSport > 0 ? formatCurrency(item.vatSport, countryCode) : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono text-blue-400">
                                            {item.vatGoods > 0 ? formatCurrency(item.vatGoods, countryCode) : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono font-bold text-white">
                                            {formatCurrency(item.totalIncl, countryCode)}
                                        </td>
                                    </tr>
                                ))}

                                {/* Totals Row */}
                                <tr className="bg-white/10 font-bold">
                                    <td className="px-6 py-4 text-white uppercase text-xs tracking-wider">
                                        Totaal
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono text-gray-300">
                                        {formatCurrency(totals.revenueExcl, countryCode)}
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono text-green-400">
                                        {formatCurrency(totals.vatSport, countryCode)}
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono text-blue-400">
                                        {formatCurrency(totals.vatGoods, countryCode)}
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono text-white text-lg">
                                        {formatCurrency(totals.totalIncl, countryCode)}
                                    </td>
                                </tr>
                            </>
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                    Geen transacties om weer te geven
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer Info */}
            <div className="p-4 bg-white/5 border-t border-white/10">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                    </svg>
                    <span>
                        Baanhuur en Lessen: {taxConfig.sportLabel} (sportdiensten).
                        Winkelartikelen: {taxConfig.goodsLabel} (goederen).
                    </span>
                </div>
            </div>
        </div>
    );
}
