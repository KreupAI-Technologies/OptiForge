'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Wallet, TrendingUp, DollarSign } from 'lucide-react';
import { ClickableKPICard } from '@/components/reports/ClickableKPICard';
import { ClickableTableRow } from '@/components/reports/ClickableTableRow';
import { fetchReportDataset } from '@/services/reports-management.service';

interface PettyCashData {
    openingBalance: number;
    totalDisbursed: number;
    totalReplenished: number;
    closingBalance: number;
    transactionCount: number;
    byCategory: { id: string; category: string; amount: number; count: number }[];
    recentTransactions: { id: string; date: string; description: string; amount: number; custodian: string }[];
}

const DEFAULT_DATA: PettyCashData = {
    openingBalance: 5000,
    totalDisbursed: 3250,
    totalReplenished: 3000,
    closingBalance: 4750,
    transactionCount: 42,
    byCategory: [
        { id: 'CAT-001', category: 'Office Supplies', amount: 850, count: 12 },
        { id: 'CAT-002', category: 'Travel', amount: 1200, count: 8 },
        { id: 'CAT-003', category: 'Misc Expenses', amount: 650, count: 14 },
        { id: 'CAT-004', category: 'Pantry', amount: 550, count: 8 },
    ],
    recentTransactions: [
        { id: 'TXN-001', date: '2025-01-22', description: 'Office supplies - Stationery', amount: 125, custodian: 'Admin Dept' },
        { id: 'TXN-002', date: '2025-01-20', description: 'Taxi fare - Client meeting', amount: 45, custodian: 'Sales Dept' },
        { id: 'TXN-003', date: '2025-01-18', description: 'Pantry items', amount: 85, custodian: 'Admin Dept' },
        { id: 'TXN-004', date: '2025-01-15', description: 'Courier charges', amount: 35, custodian: 'Logistics' },
    ],
};

export default function PettyCashReport() {
    const router = useRouter();
    const [period, setPeriod] = useState('this-month');

    const [data, setData] = useState<PettyCashData>(DEFAULT_DATA);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const payload = await fetchReportDataset<Partial<PettyCashData>>('accounts.petty-cash');
                if (cancelled) return;
                if (payload) {
                    setData({
                        openingBalance: Number(payload.openingBalance ?? DEFAULT_DATA.openingBalance),
                        totalDisbursed: Number(payload.totalDisbursed ?? DEFAULT_DATA.totalDisbursed),
                        totalReplenished: Number(payload.totalReplenished ?? DEFAULT_DATA.totalReplenished),
                        closingBalance: Number(payload.closingBalance ?? DEFAULT_DATA.closingBalance),
                        transactionCount: Number(payload.transactionCount ?? DEFAULT_DATA.transactionCount),
                        byCategory: Array.isArray(payload.byCategory) ? payload.byCategory : DEFAULT_DATA.byCategory,
                        recentTransactions: Array.isArray(payload.recentTransactions) ? payload.recentTransactions : DEFAULT_DATA.recentTransactions,
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
                    <h1 className="text-3xl font-bold mb-2">Petty Cash Report</h1>
                    <p className="text-gray-600">Petty cash tracking and reconciliation</p>
                </div>
                <div className="flex gap-2">
                    <select value={period} onChange={(e) => setPeriod(e.target.value)} className="px-4 py-2 border rounded-lg">
                        <option value="this-month">This Month</option>
                        <option value="last-month">Last Month</option>
                    </select>
                    <Button variant="outline"><Download className="mr-2 h-4 w-4" />Export</Button>
                </div>
            </div>

            {isLoading && <p className="text-xs text-gray-400 mb-2">Loading latest figures…</p>}
            {loadError && <p className="text-xs text-amber-600 mb-2">Showing sample data — {loadError}</p>}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                <ClickableKPICard
                    title="Opening Balance"
                    value={`$${data.openingBalance.toLocaleString()}`}
                    color="blue"
                    onClick={() => router.push('/reports/accounts/petty-cash/transactions')}
                />
                <ClickableKPICard
                    title="Total Disbursed"
                    value={`$${data.totalDisbursed.toLocaleString()}`}
                    color="red"
                    onClick={() => router.push('/reports/accounts/petty-cash/transactions?type=Disbursement')}
                />
                <ClickableKPICard
                    title="Replenished"
                    value={`$${data.totalReplenished.toLocaleString()}`}
                    color="green"
                    onClick={() => router.push('/reports/accounts/petty-cash/transactions?type=Replenishment')}
                />
                <ClickableKPICard
                    title="Closing Balance"
                    value={`$${data.closingBalance.toLocaleString()}`}
                    color="purple"
                    onClick={() => router.push('/reports/accounts/petty-cash/transactions')}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
                <Card>
                    <CardHeader><CardTitle>Expenses by Category</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {data.byCategory.map((item) => (
                                <div key={item.id} className="cursor-pointer hover:bg-gray-50 p-1 rounded" onClick={() => router.push(`/reports/accounts/petty-cash/transactions?category=${item.category}`)}>
                                    <div className="flex justify-between mb-2">
                                        <span className="font-medium">{item.category}</span>
                                        <span className="text-sm"><span className="font-semibold">${item.amount}</span><span className="text-gray-500 ml-2">({item.count} txns)</span></span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-orange-600 h-2 rounded-full" style={{ width: `${(item.amount / data.totalDisbursed) * 100}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Cash Flow Summary</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex justify-between pb-2 border-b"><span className="text-gray-600">Opening Balance:</span><span className="font-semibold">${data.openingBalance.toLocaleString()}</span></div>
                            <div className="flex justify-between pb-2 border-b"><span className="text-gray-600">Total Disbursed:</span><span className="font-semibold text-red-600">-${data.totalDisbursed.toLocaleString()}</span></div>
                            <div className="flex justify-between pb-2 border-b"><span className="text-gray-600">Replenished:</span><span className="font-semibold text-green-600">+${data.totalReplenished.toLocaleString()}</span></div>
                            <div className="flex justify-between pt-2 font-bold text-lg"><span>Closing Balance:</span><span className="text-purple-600">${data.closingBalance.toLocaleString()}</span></div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader><CardTitle>Recent Transactions</CardTitle></CardHeader>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Description</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Custodian</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {data.recentTransactions.map((txn) => (
                                <ClickableTableRow
                                    key={txn.id}
                                    onClick={() => router.push(`/finance/petty-cash`)}
                                >
                                    <td className="px-4 py-3 text-sm">{new Date(txn.date).toLocaleDateString()}</td>
                                    <td className="px-4 py-3 text-sm">{txn.description}</td>
                                    <td className="px-4 py-3 text-sm">{txn.custodian}</td>
                                    <td className="px-4 py-3 text-sm text-right font-semibold text-red-600">-${txn.amount}</td>
                                </ClickableTableRow>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}
