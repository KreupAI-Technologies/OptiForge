'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Building, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { ClickableKPICard } from '@/components/reports/ClickableKPICard';
import { ClickableTableRow } from '@/components/reports/ClickableTableRow';
import { fetchReportDataset } from '@/services/reports-management.service';

interface ReconciliationData {
    accountBalance: number;
    statementBalance: number;
    difference: number;
    reconciledCount: number;
    unmatchedCount: number;
    unmatched: { id: string; date: string; description: string; amount: number; type: string }[];
}

const DEFAULT_DATA: ReconciliationData = {
    accountBalance: 1250000,
    statementBalance: 1268500,
    difference: 18500,
    reconciledCount: 142,
    unmatchedCount: 8,
    unmatched: [
        { id: 'TXN-001', date: '2025-01-20', description: 'Wire Transfer - Vendor Payment', amount: 12500, type: 'Debit' },
        { id: 'TXN-002', date: '2025-01-18', description: 'Customer Deposit', amount: 8500, type: 'Credit' },
        { id: 'TXN-003', date: '2025-01-15', description: 'Bank Charges', amount: -125, type: 'Debit' },
        { id: 'TXN-004', date: '2025-01-12', description: 'Interest Income', amount: 450, type: 'Credit' },
        { id: 'TXN-005', date: '2025-01-10', description: 'Check #1245', amount: -2850, type: 'Debit' },
    ],
};

export default function BankReconciliationReport() {
    const router = useRouter();
    const [account, setAccount] = useState('main-account');

    const [data, setData] = useState<ReconciliationData>(DEFAULT_DATA);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const payload = await fetchReportDataset<Partial<ReconciliationData>>('accounts.reconciliation');
                if (cancelled) return;
                if (payload) {
                    setData({
                        accountBalance: Number(payload.accountBalance ?? DEFAULT_DATA.accountBalance),
                        statementBalance: Number(payload.statementBalance ?? DEFAULT_DATA.statementBalance),
                        difference: Number(payload.difference ?? DEFAULT_DATA.difference),
                        reconciledCount: Number(payload.reconciledCount ?? DEFAULT_DATA.reconciledCount),
                        unmatchedCount: Number(payload.unmatchedCount ?? DEFAULT_DATA.unmatchedCount),
                        unmatched: Array.isArray(payload.unmatched) ? payload.unmatched : DEFAULT_DATA.unmatched,
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
                    <h1 className="text-3xl font-bold mb-2">Bank Reconciliation Report</h1>
                    <p className="text-gray-600">Bank statement matching and variance analysis</p>
                </div>
                <div className="flex gap-2">
                    <select value={account} onChange={(e) => setAccount(e.target.value)} className="px-4 py-2 border rounded-lg">
                        <option value="main-account">Main Operating Account</option>
                        <option value="payroll-account">Payroll Account</option>
                        <option value="savings-account">Savings Account</option>
                    </select>
                    <Button variant="outline"><Download className="mr-2 h-4 w-4" />Export</Button>
                </div>
            </div>

            {isLoading && <p className="text-xs text-gray-400 mb-2">Loading latest figures…</p>}
            {loadError && <p className="text-xs text-amber-600 mb-2">Showing sample data — {loadError}</p>}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                <ClickableKPICard
                    title="Book Balance"
                    value={`$${(data.accountBalance / 1000).toFixed(0)}K`}
                    color="blue"
                    onClick={() => router.push('/reports/accounts/reconciliation/status')}
                />
                <ClickableKPICard
                    title="Bank Statement"
                    value={`$${(data.statementBalance / 1000).toFixed(0)}K`}
                    color="green"
                    onClick={() => router.push('/reports/accounts/reconciliation/status?status=Reconciled')}
                />
                <ClickableKPICard
                    title="Difference"
                    value={`$${(data.difference / 1000).toFixed(1)}K`}
                    color="orange"
                    onClick={() => router.push('/reports/accounts/reconciliation/status?status=Unmatched')}
                />
                <ClickableKPICard
                    title="Reconciliation Status"
                    value={`${((data.reconciledCount / (data.reconciledCount + data.unmatchedCount)) * 100).toFixed(0)}%`}
                    color="purple"
                    description={`${data.reconciledCount} matched`}
                    onClick={() => router.push('/reports/accounts/reconciliation/status?status=Reconciled')}
                />
            </div>

            <Card className="mb-3">
                <CardHeader><CardTitle>Unmatched Transactions ({data.unmatchedCount})</CardTitle></CardHeader>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Description</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Type</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Amount</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {data.unmatched.map((txn) => (
                                <ClickableTableRow
                                    key={txn.id}
                                    onClick={() => router.push(`/accounts/transactions/${txn.id}`)}
                                >
                                    <td className="px-4 py-3 text-sm">{new Date(txn.date).toLocaleDateString()}</td>
                                    <td className="px-4 py-3 text-sm">{txn.description}</td>
                                    <td className="px-4 py-3 text-center">
                                        <Badge className={txn.type === 'Credit' ? 'bg-green-600' : 'bg-red-600'}>{txn.type}</Badge>
                                    </td>
                                    <td className={`px-4 py-3 text-sm text-right font-semibold ${txn.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        ${Math.abs(txn.amount).toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); /* Add match logic */ }}>Match</Button>
                                    </td>
                                </ClickableTableRow>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Card>
                    <CardHeader><CardTitle>Reconciliation Summary</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex justify-between cursor-pointer hover:bg-gray-50 p-1 rounded" onClick={() => router.push('/reports/accounts/reconciliation/status?status=All')}>
                                <span className="text-gray-600">Total Transactions</span>
                                <span className="font-semibold">{data.reconciledCount + data.unmatchedCount}</span>
                            </div>
                            <div className="flex justify-between cursor-pointer hover:bg-gray-50 p-1 rounded" onClick={() => router.push('/reports/accounts/reconciliation/status?status=Reconciled')}>
                                <span className="text-gray-600 flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-600" />Reconciled</span>
                                <span className="font-semibold text-green-600">{data.reconciledCount}</span>
                            </div>
                            <div className="flex justify-between cursor-pointer hover:bg-gray-50 p-1 rounded" onClick={() => router.push('/reports/accounts/reconciliation/status?status=Unmatched')}>
                                <span className="text-gray-600 flex items-center gap-2"><XCircle className="h-4 w-4 text-red-600" />Unmatched</span>
                                <span className="font-semibold text-red-600">{data.unmatchedCount}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Balance Verification</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span>Book Balance:</span><span className="font-semibold">${data.accountBalance.toLocaleString()}</span></div>
                            <div className="flex justify-between"><span>Add: Deposits in Transit:</span><span className="text-green-600">+$8,950</span></div>
                            <div className="flex justify-between"><span>Less: Outstanding Checks:</span><span className="text-red-600">-$2,975</span></div>
                            <div className="border-t pt-2 flex justify-between font-semibold"><span>Adjusted Balance:</span><span>${(data.accountBalance + 8950 - 2975).toLocaleString()}</span></div>
                            <div className="border-t pt-2 flex justify-between"><span>Bank Statement Balance:</span><span>${data.statementBalance.toLocaleString()}</span></div>
                            <div className="border-t pt-2 flex justify-between font-bold text-lg"><span>Variance:</span><span className={data.difference !== 0 ? 'text-orange-600' : 'text-green-600'}>${data.difference.toLocaleString()}</span></div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
