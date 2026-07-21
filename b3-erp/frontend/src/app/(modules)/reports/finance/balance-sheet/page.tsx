'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp, TrendingDown } from 'lucide-react';
import { ClickableKPICard } from '@/components/reports/ClickableKPICard';
import { fetchReportDataset } from '@/services/reports-management.service';
import { exportToCsv } from '@/lib/export';

interface BalanceSheetData {
    totalAssets: number;
    totalLiabilities: number;
    totalEquity: number;
    currentAssets: number;
    fixedAssets: number;
    currentLiabilities: number;
    longTermLiabilities: number;
}

const DEFAULT_DATA: BalanceSheetData = {
    totalAssets: 15500000,
    totalLiabilities: 8200000,
    totalEquity: 7300000,
    currentAssets: 6500000,
    fixedAssets: 9000000,
    currentLiabilities: 3200000,
    longTermLiabilities: 5000000,
};

export default function BalanceSheetReport() {
    const router = useRouter();
    const [data, setData] = useState<BalanceSheetData>(DEFAULT_DATA);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const payload = await fetchReportDataset<Partial<BalanceSheetData>>('finance.balance-sheet');
                if (cancelled) return;
                if (payload) {
                    setData({
                        totalAssets: Number(payload.totalAssets ?? DEFAULT_DATA.totalAssets),
                        totalLiabilities: Number(payload.totalLiabilities ?? DEFAULT_DATA.totalLiabilities),
                        totalEquity: Number(payload.totalEquity ?? DEFAULT_DATA.totalEquity),
                        currentAssets: Number(payload.currentAssets ?? DEFAULT_DATA.currentAssets),
                        fixedAssets: Number(payload.fixedAssets ?? DEFAULT_DATA.fixedAssets),
                        currentLiabilities: Number(payload.currentLiabilities ?? DEFAULT_DATA.currentLiabilities),
                        longTermLiabilities: Number(payload.longTermLiabilities ?? DEFAULT_DATA.longTermLiabilities),
                    });
                }
            } catch (e) {
                if (!cancelled) setLoadError(e instanceof Error ? e.message : 'Failed to load report');
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    return (
        <div className="w-full p-3">
            <div className="flex justify-between items-center mb-3">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Balance Sheet</h1>
                    <p className="text-gray-600">Statement of financial position - Click cards to drill down</p>
                </div>
                <Button variant="outline" onClick={() => exportToCsv('balance-sheet', [data])}><Download className="mr-2 h-4 w-4" />Export</Button>
            </div>

            {isLoading && <p className="text-xs text-gray-400 mb-2">Loading latest figures…</p>}
            {loadError && <p className="text-xs text-amber-600 mb-2">Showing sample data — {loadError}</p>}

            {/* Summary KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <ClickableKPICard
                    title="Total Assets"
                    value={`₹${(data.totalAssets / 10000000).toFixed(2)}Cr`}
                    color="blue"
                    description="Click for breakdown"
                    onClick={() => router.push('/reports/finance/balance-sheet/assets')}
                />
                <ClickableKPICard
                    title="Total Liabilities"
                    value={`₹${(data.totalLiabilities / 10000000).toFixed(2)}Cr`}
                    color="red"
                    description="Click for breakdown"
                    onClick={() => router.push('/reports/finance/balance-sheet/liabilities')}
                />
                <ClickableKPICard
                    title="Total Equity"
                    value={`₹${(data.totalEquity / 10000000).toFixed(2)}Cr`}
                    color="green"
                    description="Click for breakdown"
                    onClick={() => router.push('/reports/finance/balance-sheet/equity')}
                />
            </div>

            {/* Balance Sheet Statement */}
            <Card>
                <CardHeader><CardTitle>Balance Sheet Statement</CardTitle></CardHeader>
                <CardContent className="p-0">
                    <table className="w-full">
                        <tbody>
                            <tr className="bg-blue-50 cursor-pointer hover:bg-blue-100" onClick={() => router.push('/reports/finance/balance-sheet/assets')}>
                                <td className="px-3 py-2 font-bold text-blue-900">ASSETS</td>
                                <td className="px-3 py-2 text-right font-bold text-blue-900">
                                    ₹{data.totalAssets.toLocaleString()}
                                </td>
                            </tr>
                            <tr className="border-b hover:bg-gray-50">
                                <td className="px-6 py-2 pl-12">Current Assets</td>
                                <td className="px-6 py-2 text-right">₹{data.currentAssets.toLocaleString()}</td>
                            </tr>
                            <tr className="border-b hover:bg-gray-50">
                                <td className="px-6 py-2 pl-12">Fixed Assets</td>
                                <td className="px-6 py-2 text-right">₹{data.fixedAssets.toLocaleString()}</td>
                            </tr>

                            <tr className="bg-red-50 cursor-pointer hover:bg-red-100" onClick={() => router.push('/reports/finance/balance-sheet/liabilities')}>
                                <td className="px-3 py-2 font-bold text-red-900">LIABILITIES</td>
                                <td className="px-3 py-2 text-right font-bold text-red-900">
                                    ₹{data.totalLiabilities.toLocaleString()}
                                </td>
                            </tr>
                            <tr className="border-b hover:bg-gray-50">
                                <td className="px-6 py-2 pl-12">Current Liabilities</td>
                                <td className="px-6 py-2 text-right">₹{data.currentLiabilities.toLocaleString()}</td>
                            </tr>
                            <tr className="border-b hover:bg-gray-50">
                                <td className="px-6 py-2 pl-12">Long-term Liabilities</td>
                                <td className="px-6 py-2 text-right">₹{data.longTermLiabilities.toLocaleString()}</td>
                            </tr>

                            <tr className="bg-green-50 cursor-pointer hover:bg-green-100" onClick={() => router.push('/reports/finance/balance-sheet/equity')}>
                                <td className="px-3 py-2 font-bold text-green-900">EQUITY</td>
                                <td className="px-3 py-2 text-right font-bold text-green-900">
                                    ₹{data.totalEquity.toLocaleString()}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}
