'use client';

import { useState } from 'react';

interface ExportButtonProps {
    data: any[];
    filename?: string;
}

export default function ExportButton({ data, filename = 'export.csv' }: ExportButtonProps) {
    const [loading, setLoading] = useState(false);

    const handleExport = () => {
        setLoading(true);
        try {
            if (!data || data.length === 0) {
                alert("Geen data om te exporteren.");
                setLoading(false);
                return;
            }

            // 1. Get headers efficiently
            // Flatten nested objects specifically for bookings
            const flattenedData = data.map(row => {
                const flat: any = {};
                // Copy primitive values
                for (const key in row) {
                    if (typeof row[key] !== 'object' || row[key] === null) {
                        flat[key] = row[key];
                    } else if (key === 'user_profiles' && row[key]) {
                        // Handle User Profile specifically
                        flat['user_name'] = row[key].full_name;
                        flat['user_email'] = row[key].email;
                    } else if (key === 'court' && row[key]) {
                        flat['court_name'] = row[key].name;
                    }
                }
                return flat;
            });

            const headers = Object.keys(flattenedData[0]);

            // 2. Convert to CSV string
            const csvContent = [
                headers.join(','), // Header row
                ...flattenedData.map(row =>
                    headers.map(header => {
                        const cell = row[header] === null || row[header] === undefined ? '' : row[header];
                        // Escape quotes and wrap in quotes if contains comma
                        const stringCell = String(cell);
                        return stringCell.includes(',') || stringCell.includes('"')
                            ? `"${stringCell.replace(/"/g, '""')}"`
                            : stringCell;
                    }).join(',')
                )
            ].join('\n');

            // 3. Trigger download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Export failed", error);
            alert("Export mislukt.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleExport}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl text-sm font-bold transition-transform hover:scale-105 shadow-lg shadow-blue-600/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <span>{loading ? '⏳' : '📥'}</span>
            {loading ? 'Bezig...' : 'Download CSV'}
        </button>
    );
}
