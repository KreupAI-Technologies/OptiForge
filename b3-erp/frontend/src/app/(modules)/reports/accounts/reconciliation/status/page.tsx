'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ReportDetailPage } from '@/components/reports/ReportDetailPage';
import { ClickableTableRow } from '@/components/reports/ClickableTableRow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { fetchReportRows } from '@/services/reports-management.service';

function ReconciliationStatusContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const status = searchParams.get('status') || 'All';

    const [transactions, setTransactions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const raw = await fetchReportRows<any>('accounts.reconciliation.status');
                const mapped = raw.map((r: any) => ({
                    id: r.id,
                    date: r.date,
                    description: r.description,
                    amount: Number(r.amount ?? 0),
                    type: r.type ?? '',
                    status: r.status ?? '',
                }));
                if (!cancelled) setTransactions(mapped);
            } catch (e) {
                if (!cancelled) { setLoadError(e instanceof Error ? e.message : 'Failed to load'); setTransactions([]); }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const filteredTransactions = status === 'All'
        ? transactions
        : transactions.filter(t => t.status === status);

    return (
        <ReportDetailPage
            title={`Reconciliation: ${status}`}
            description={`List of transactions with status: ${status}`}
            breadcrumbs={[
                { label: 'Reports', href: '/reports' },
                { label: 'Accounts', href: '/reports' },
                { label: 'Bank Reconciliation', href: '/reports/accounts/reconciliation' },
                { label: status }
            ]}
        >
            {isLoading && <div className="mb-3 rounded border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">Loading…</div>}
            {loadError && !isLoading && <div className="mb-3 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{loadError}</div>}
            <Card>
                <CardHeader>
                    <CardTitle>Transaction List</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredTransactions.map((txn) => (
                                <ClickableTableRow
                                    key={txn.id}
                                    onClick={() => router.push(`/accounts/transactions/${txn.id}`)}
                                >
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{new Date(txn.date).toLocaleDateString()}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{txn.description}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-center">
                                        <Badge className={txn.type === 'Credit' ? 'bg-green-600' : 'bg-red-600'}>{txn.type}</Badge>
                                    </td>
                                    <td className={`px-3 py-2 whitespace-nowrap text-sm text-right font-medium ${txn.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        ${Math.abs(txn.amount).toLocaleString()}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-center">
                                        <Badge variant={txn.status === 'Unmatched' ? 'destructive' : 'default'}>
                                            {txn.status}
                                        </Badge>
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-center">
                                        {txn.status === 'Unmatched' && (
                                            <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); /* Add match logic */ }}>Match</Button>
                                        )}
                                    </td>
                                </ClickableTableRow>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </ReportDetailPage>
    );
}

export default function ReconciliationStatusPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ReconciliationStatusContent />
        </Suspense>
    );
}
