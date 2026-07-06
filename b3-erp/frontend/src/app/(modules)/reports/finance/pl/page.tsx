'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp, TrendingDown } from 'lucide-react';
import { ClickableKPICard } from '@/components/reports/ClickableKPICard';
import { fetchReportDataset } from '@/services/reports-management.service';

interface PLStatement {
    revenue: { category: string; amount: number }[];
    totalRevenue: number;
    cogs: { category: string; amount: number }[];
    totalCOGS: number;
    grossProfit: number;
    grossMargin: number;
    operatingExpenses: { category: string; amount: number }[];
    totalOpEx: number;
    operatingIncome: number;
    otherIncome: number;
    otherExpenses: number;
    netIncome: number;
    netMargin: number;
}

const DEFAULT_DATA: PLStatement = {
    revenue: [
        { category: 'Product Sales', amount: 2850000 },
        { category: 'Service Revenue', amount: 450000 },
        { category: 'Consulting', amount: 200000 },
    ],
    totalRevenue: 3500000,
    cogs: [
        { category: 'Raw Materials', amount: 1200000 },
        { category: 'Direct Labor', amount: 450000 },
        { category: 'Manufacturing Overhead', amount: 350000 },
    ],
    totalCOGS: 2000000,
    grossProfit: 1500000,
    grossMargin: 42.9,
    operatingExpenses: [
        { category: 'Salaries & Wages', amount: 580000 },
        { category: 'Rent & Utilities', amount: 120000 },
        { category: 'Marketing & Sales', amount: 180000 },
        { category: 'R&D', amount: 150000 },
        { category: 'Administrative', amount: 90000 },
    ],
    totalOpEx: 1120000,
    operatingIncome: 380000,
    otherIncome: 25000,
    otherExpenses: 45000,
    netIncome: 360000,
    netMargin: 10.3,
};

export default function ProfitLossReport() {
    const router = useRouter();
    const [period, setPeriod] = useState('this-month');
    const [plData, setPlData] = useState<PLStatement>(DEFAULT_DATA);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const payload = await fetchReportDataset<Partial<PLStatement>>('finance.pl');
                if (cancelled) return;
                if (payload) {
                    setPlData({
                        revenue: Array.isArray(payload.revenue) ? payload.revenue : DEFAULT_DATA.revenue,
                        totalRevenue: Number(payload.totalRevenue ?? DEFAULT_DATA.totalRevenue),
                        cogs: Array.isArray(payload.cogs) ? payload.cogs : DEFAULT_DATA.cogs,
                        totalCOGS: Number(payload.totalCOGS ?? DEFAULT_DATA.totalCOGS),
                        grossProfit: Number(payload.grossProfit ?? DEFAULT_DATA.grossProfit),
                        grossMargin: Number(payload.grossMargin ?? DEFAULT_DATA.grossMargin),
                        operatingExpenses: Array.isArray(payload.operatingExpenses) ? payload.operatingExpenses : DEFAULT_DATA.operatingExpenses,
                        totalOpEx: Number(payload.totalOpEx ?? DEFAULT_DATA.totalOpEx),
                        operatingIncome: Number(payload.operatingIncome ?? DEFAULT_DATA.operatingIncome),
                        otherIncome: Number(payload.otherIncome ?? DEFAULT_DATA.otherIncome),
                        otherExpenses: Number(payload.otherExpenses ?? DEFAULT_DATA.otherExpenses),
                        netIncome: Number(payload.netIncome ?? DEFAULT_DATA.netIncome),
                        netMargin: Number(payload.netMargin ?? DEFAULT_DATA.netMargin),
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
            {/* Header */}
            <div className="flex justify-between items-center mb-3">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Profit & Loss Statement</h1>
                    <p className="text-gray-600">Comprehensive income statement - click any card or row to drill down</p>
                </div>
                <div className="flex gap-2">
                    <select value={period} onChange={(e) => setPeriod(e.target.value)} className="px-4 py-2 border rounded-lg">
                        <option value="this-month">This Month</option>
                        <option value="this-quarter">This Quarter</option>
                        <option value="this-year">This Year</option>
                        <option value="ytd">Year to Date</option>
                    </select>
                    <Button variant="outline"><Download className="mr-2 h-4 w-4" />Export Excel</Button>
                    <Button variant="outline"><Download className="mr-2 h-4 w-4" />Export PDF</Button>
                </div>
            </div>

            {isLoading && <p className="text-xs text-gray-400 mb-2">Loading latest figures…</p>}
            {loadError && <p className="text-xs text-amber-600 mb-2">Showing sample data — {loadError}</p>}

            {/* Summary Cards - NOW CLICKABLE */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                <ClickableKPICard
                    title="Total Revenue"
                    value={`$${(plData.totalRevenue / 1000).toFixed(0)}K`}
                    color="blue"
                    onClick={() => router.push('/reports/finance/pl/revenue')}
                />
                <ClickableKPICard
                    title="Cost of Goods Sold"
                    value={`$${(plData.totalCOGS / 1000).toFixed(0)}K`}
                    color="red"
                    onClick={() => router.push('/reports/finance/pl/cogs')}
                />
                <ClickableKPICard
                    title="Gross Profit"
                    value={`$${(plData.grossProfit / 1000).toFixed(0)}K`}
                    description={`${plData.grossMargin}% margin`}
                    color="green"
                    onClick={() => router.push('/reports/finance/pl/cogs')}
                />
                <ClickableKPICard
                    title="Operating Expenses"
                    value={`$${(plData.totalOpEx / 1000).toFixed(0)}K`}
                    color="orange"
                    onClick={() => router.push('/reports/finance/pl/expenses')}
                />
                <ClickableKPICard
                    title="Net Income"
                    value={`$${(plData.netIncome / 1000).toFixed(0)}K`}
                    description={`${plData.netMargin}% margin`}
                    color="purple"
                />
            </div>

            {/* P&L Statement Table */}
            <Card>
                <CardHeader><CardTitle>Income Statement</CardTitle></CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <tbody>
                                {/* Revenue Section */}
                                <tr className="bg-blue-50">
                                    <td className="px-3 py-2 font-bold text-blue-900">REVENUE</td>
                                    <td className="px-3 py-2 text-right font-bold text-blue-900">
                                        ${plData.totalRevenue.toLocaleString()}
                                    </td>
                                </tr>
                                {plData.revenue.map((item, idx) => (
                                    <tr key={idx} className="border-b hover:bg-gray-50">
                                        <td className="px-6 py-2 pl-12">{item.category}</td>
                                        <td className="px-6 py-2 text-right">${item.amount.toLocaleString()}</td>
                                    </tr>
                                ))}

                                {/* COGS Section */}
                                <tr className="bg-red-50">
                                    <td className="px-3 py-2 font-bold text-red-900">COST OF GOODS SOLD</td>
                                    <td className="px-3 py-2 text-right font-bold text-red-900">
                                        ${plData.totalCOGS.toLocaleString()}
                                    </td>
                                </tr>
                                {plData.cogs.map((item, idx) => (
                                    <tr key={idx} className="border-b hover:bg-gray-50">
                                        <td className="px-6 py-2 pl-12">{item.category}</td>
                                        <td className="px-6 py-2 text-right">${item.amount.toLocaleString()}</td>
                                    </tr>
                                ))}

                                {/* Gross Profit */}
                                <tr className="bg-green-50">
                                    <td className="px-3 py-2 font-bold text-green-900">GROSS PROFIT</td>
                                    <td className="px-3 py-2 text-right font-bold text-green-900">
                                        ${plData.grossProfit.toLocaleString()}
                                        <span className="text-sm ml-2">({plData.grossMargin}%)</span>
                                    </td>
                                </tr>

                                {/* Operating Expenses */}
                                <tr className="bg-orange-50">
                                    <td className="px-3 py-2 font-bold text-orange-900">OPERATING EXPENSES</td>
                                    <td className="px-3 py-2 text-right font-bold text-orange-900">
                                        ${plData.totalOpEx.toLocaleString()}
                                    </td>
                                </tr>
                                {plData.operatingExpenses.map((item, idx) => (
                                    <tr key={idx} className="border-b hover:bg-gray-50">
                                        <td className="px-6 py-2 pl-12">{item.category}</td>
                                        <td className="px-6 py-2 text-right">${item.amount.toLocaleString()}</td>
                                    </tr>
                                ))}

                                {/* Operating Income */}
                                <tr className="bg-purple-50">
                                    <td className="px-3 py-2 font-bold text-purple-900">OPERATING INCOME</td>
                                    <td className="px-3 py-2 text-right font-bold text-purple-900">
                                        ${plData.operatingIncome.toLocaleString()}
                                    </td>
                                </tr>

                                {/* Other Income/Expenses */}
                                <tr className="border-b hover:bg-gray-50">
                                    <td className="px-6 py-2 pl-12">Other Income</td>
                                    <td className="px-6 py-2 text-right">${plData.otherIncome.toLocaleString()}</td>
                                </tr>
                                <tr className="border-b hover:bg-gray-50">
                                    <td className="px-6 py-2 pl-12">Other Expenses</td>
                                    <td className="px-6 py-2 text-right text-red-600">
                                        (${plData.otherExpenses.toLocaleString()})
                                    </td>
                                </tr>

                                {/* Net Income */}
                                <tr className="bg-gradient-to-r from-green-600 to-green-700">
                                    <td className="px-3 py-2 font-bold text-white text-lg">NET INCOME</td>
                                    <td className="px-3 py-2 text-right font-bold text-white text-lg flex items-center justify-end gap-2">
                                        ${plData.netIncome.toLocaleString()}
                                        {plData.netIncome > 0 ? (
                                            <TrendingUp className="h-5 w-5" />
                                        ) : (
                                            <TrendingDown className="h-5 w-5" />
                                        )}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
