'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ReportDetailPage } from '@/components/reports/ReportDetailPage';
import { ClickableTableRow } from '@/components/reports/ClickableTableRow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchDomainList } from '@/services/reports-data.service';

function PettyCashTransactionsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const type = searchParams.get('type') || 'All';
    const category = searchParams.get('category');

    const [transactions, setTransactions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const raw = await fetchDomainList<any>('api/accounts/petty-cash');
                const mapped = raw.map((r: any) => ({
                    id: r.transactionNumber ?? r.id,
                    date: r.transactionDate ?? r.date ?? '',
                    description: r.description ?? r.particulars ?? '',
                    amount: Number(r.amount ?? 0),
                    custodian: r.custodian ?? r.custodianName ?? '',
                    type: r.transactionType ?? r.type ?? '',
                    category: r.category ?? '',
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

    let filteredTransactions = transactions;

    if (category) {
        filteredTransactions = filteredTransactions.filter(t => t.category === category);
    } else if (type !== 'All') {
        filteredTransactions = filteredTransactions.filter(t => t.type === type);
    }

    const title = category ? `Petty Cash: ${category}` : `Petty Cash: ${type}`;

    return (
        <ReportDetailPage
            title={title}
            description={`List of petty cash transactions`}
            breadcrumbs={[
                { label: 'Reports', href: '/reports' },
                { label: 'Accounts', href: '/reports' },
                { label: 'Petty Cash', href: '/reports/accounts/petty-cash' },
                { label: 'Transactions' }
            ]}
        >
            {isLoading && <div className="mb-3 rounded border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">Loading…</div>}
            {loadError && !isLoading && <div className="mb-3 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{loadError}</div>}
            <Card>
                <CardHeader>
                    <CardTitle>Transaction Log</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Custodian</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredTransactions.map((txn) => (
                                <ClickableTableRow
                                    key={txn.id}
                                    onClick={() => router.push(`/finance/petty-cash`)}
                                >
                                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-blue-600">{txn.id}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{new Date(txn.date).toLocaleDateString()}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{txn.description}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{txn.custodian}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{txn.category}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-center">
                                        <Badge variant={txn.type === 'Replenishment' ? 'default' : 'secondary'}>
                                            {txn.type}
                                        </Badge>
                                    </td>
                                    <td className={`px-3 py-2 whitespace-nowrap text-sm text-right font-medium ${txn.type === 'Replenishment' ? 'text-green-600' : 'text-red-600'}`}>
                                        {txn.type === 'Replenishment' ? '+' : '-'}${txn.amount.toLocaleString()}
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

export default function PettyCashTransactionsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PettyCashTransactionsContent />
        </Suspense>
    );
}
