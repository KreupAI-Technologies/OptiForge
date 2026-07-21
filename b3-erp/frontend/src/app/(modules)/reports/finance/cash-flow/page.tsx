'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp, TrendingDown } from 'lucide-react';
import { ClickableKPICard } from '@/components/reports/ClickableKPICard';
import { fetchReportDataset } from '@/services/reports-management.service';
import { exportToCsv } from '@/lib/export';

interface CashFlowData {
    operatingCashFlow: number;
    investingCashFlow: number;
    financingCashFlow: number;
    netCashFlow: number;
    beginningCash: number;
    endingCash: number;
}

const DEFAULT_DATA: CashFlowData = {
    operatingCashFlow: 450000,
    investingCashFlow: -120000,
    financingCashFlow: -50000,
    netCashFlow: 280000,
    beginningCash: 1200000,
    endingCash: 1480000,
};

export default function CashFlowReport() {
    const router = useRouter();
    const [data, setData] = useState<CashFlowData>(DEFAULT_DATA);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const payload = await fetchReportDataset<Partial<CashFlowData>>('finance.cash-flow');
                if (cancelled) return;
                if (payload) {
                    setData({
                        operatingCashFlow: Number(payload.operatingCashFlow ?? DEFAULT_DATA.operatingCashFlow),
                        investingCashFlow: Number(payload.investingCashFlow ?? DEFAULT_DATA.investingCashFlow),
                        financingCashFlow: Number(payload.financingCashFlow ?? DEFAULT_DATA.financingCashFlow),
                        netCashFlow: Number(payload.netCashFlow ?? DEFAULT_DATA.netCashFlow),
                        beginningCash: Number(payload.beginningCash ?? DEFAULT_DATA.beginningCash),
                        endingCash: Number(payload.endingCash ?? DEFAULT_DATA.endingCash),
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
                    <h1 className="text-3xl font-bold mb-2">Cash Flow Statement</h1>
                    <p className="text-gray-600">Analysis of cash inflows and outflows</p>
                </div>
                <Button variant="outline" onClick={() => exportToCsv('cash-flow', [data])}><Download className="mr-2 h-4 w-4" />Export</Button>
            </div>

            {isLoading && <p className="text-xs text-gray-400 mb-2">Loading latest figures…</p>}
            {loadError && <p className="text-xs text-amber-600 mb-2">Showing sample data — {loadError}</p>}

            {/* Summary KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                <ClickableKPICard
                    title="Operating Activities"
                    value={`₹${(data.operatingCashFlow / 1000).toFixed(0)}K`}
                    color="green"
                    description="Click for details"
                    onClick={() => router.push('/reports/finance/cash-flow/operating')}
                />
                <ClickableKPICard
                    title="Investing Activities"
                    value={`₹${(data.investingCashFlow / 1000).toFixed(0)}K`}
                    color="blue"
                    description="Click for details"
                    onClick={() => router.push('/reports/finance/cash-flow/investing')}
                />
                <ClickableKPICard
                    title="Financing Activities"
                    value={`₹${(data.financingCashFlow / 1000).toFixed(0)}K`}
                    color="orange"
                    description="Click for details"
                    onClick={() => router.push('/reports/finance/cash-flow/financing')}
                />
                <ClickableKPICard
                    title="Net Cash Flow"
                    value={`₹${(data.netCashFlow / 1000).toFixed(0)}K`}
                    color={data.netCashFlow > 0 ? 'green' : 'red'}
                />
            </div>

            {/* Cash Flow Statement */}
            <Card>
                <CardHeader><CardTitle>Cash Flow Statement</CardTitle></CardHeader>
                <CardContent className="p-0">
                    <table className="w-full">
                        <tbody>
                            <tr className="bg-green-50 cursor-pointer hover:bg-green-100" onClick={() => router.push('/reports/finance/cash-flow/operating')}>
                                <td className="px-3 py-2 font-bold text-green-900">Cash Flow from Operating Activities</td>
                                <td className="px-3 py-2 text-right font-bold text-green-900">
                                    ₹{data.operatingCashFlow.toLocaleString()}
                                </td>
                            </tr>
                            <tr className="border-b hover:bg-gray-50">
                                <td className="px-6 py-2 pl-12">Net Income</td>
                                <td className="px-6 py-2 text-right">₹360,000</td>
                            </tr>
                            <tr className="border-b hover:bg-gray-50">
                                <td className="px-6 py-2 pl-12">Depreciation & Amortization</td>
                                <td className="px-6 py-2 text-right">₹45,000</td>
                            </tr>
                            <tr className="border-b hover:bg-gray-50">
                                <td className="px-6 py-2 pl-12">Changes in Working Capital</td>
                                <td className="px-6 py-2 text-right">₹45,000</td>
                            </tr>

                            <tr className="bg-blue-50 cursor-pointer hover:bg-blue-100" onClick={() => router.push('/reports/finance/cash-flow/investing')}>
                                <td className="px-3 py-2 font-bold text-blue-900">Cash Flow from Investing Activities</td>
                                <td className="px-3 py-2 text-right font-bold text-blue-900">
                                    ₹{data.investingCashFlow.toLocaleString()}
                                </td>
                            </tr>
                            <tr className="border-b hover:bg-gray-50">
                                <td className="px-6 py-2 pl-12">Purchase of Equipment</td>
                                <td className="px-6 py-2 text-right text-red-600">(₹150,000)</td>
                            </tr>
                            <tr className="border-b hover:bg-gray-50">
                                <td className="px-6 py-2 pl-12">Sale of Assets</td>
                                <td className="px-6 py-2 text-right">₹30,000</td>
                            </tr>

                            <tr className="bg-orange-50 cursor-pointer hover:bg-orange-100" onClick={() => router.push('/reports/finance/cash-flow/financing')}>
                                <td className="px-3 py-2 font-bold text-orange-900">Cash Flow from Financing Activities</td>
                                <td className="px-3 py-2 text-right font-bold text-orange-900">
                                    ₹{data.financingCashFlow.toLocaleString()}
                                </td>
                            </tr>
                            <tr className="border-b hover:bg-gray-50">
                                <td className="px-6 py-2 pl-12">Loan Repayment</td>
                                <td className="px-6 py-2 text-right text-red-600">(₹50,000)</td>
                            </tr>

                            <tr className="bg-gray-100 font-bold border-t-2 border-gray-300">
                                <td className="px-3 py-2">Net Increase in Cash</td>
                                <td className="px-3 py-2 text-right">₹{data.netCashFlow.toLocaleString()}</td>
                            </tr>
                            <tr className="bg-gray-50">
                                <td className="px-3 py-2">Cash at Beginning of Period</td>
                                <td className="px-3 py-2 text-right">₹{data.beginningCash.toLocaleString()}</td>
                            </tr>
                            <tr className="bg-gray-50 font-bold">
                                <td className="px-3 py-2">Cash at End of Period</td>
                                <td className="px-3 py-2 text-right text-blue-600">₹{data.endingCash.toLocaleString()}</td>
                            </tr>
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}
