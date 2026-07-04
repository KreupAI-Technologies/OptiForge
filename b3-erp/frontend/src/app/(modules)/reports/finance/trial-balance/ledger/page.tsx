'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ReportDetailPage } from '@/components/reports/ReportDetailPage';
import { fetchDomainList } from '@/services/reports-data.service';
import { ClickableTableRow } from '@/components/reports/ClickableTableRow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

function LedgerContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const code = searchParams.get('code') || 'Unknown';
    const name = searchParams.get('name') || 'Unknown Account';

    const [transactions, setTransactions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true); setLoadError(null);
            try {
                const raw = await fetchDomainList<any>('finance/journal-entries');
                const mapped = raw.map((r: any) => ({ id: r.entryNumber ?? r.id, date: r.entryDate ?? '', description: r.narration ?? r.description ?? '', debit: Number(r.totalDebit ?? 0), credit: Number(r.totalCredit ?? 0), ref: r.referenceNumber ?? '' }));
                if (!cancelled) setTransactions(mapped);
            } catch (e) {
                if (!cancelled) { setLoadError(e instanceof Error ? e.message : 'Failed to load'); setTransactions([]); }
            } finally { if (!cancelled) setIsLoading(false); }
        })();
        return () => { cancelled = true; };
    }, []);

    let runningBalance = 0;
    const transactionsWithBalance = transactions.map(txn => {
        runningBalance += txn.debit - txn.credit;
        return { ...txn, balance: runningBalance };
    });

    return (
        <ReportDetailPage
            title={`Ledger: ${code} - ${name}`}
            description={`Transaction history for account ${code}`}
            breadcrumbs={[
                { label: 'Reports', href: '/reports' },
                { label: 'Finance', href: '/reports' },
                { label: 'Trial Balance', href: '/reports/finance/trial-balance' },
                { label: 'Ledger' }
            ]}
        >
            {isLoading && <div className="mb-3 rounded border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">Loading…</div>}
            {loadError && !isLoading && <div className="mb-3 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{loadError}</div>}
            <Card>
                <CardHeader>
                    <CardTitle>Account Ledger</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Journal ID</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Debit</th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Credit</th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {transactionsWithBalance.map((txn) => (
                                <ClickableTableRow
                                    key={txn.id}
                                    onClick={() => router.push(`/accounts/journal/${txn.id}`)}
                                >
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{txn.date}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-blue-600">{txn.id}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{txn.description}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{txn.ref}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-900">
                                        {txn.debit > 0 ? `₹${txn.debit.toLocaleString()}` : '-'}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-900">
                                        {txn.credit > 0 ? `₹${txn.credit.toLocaleString()}` : '-'}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-right font-bold text-gray-900">
                                        ₹{txn.balance.toLocaleString()}
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

export default function LedgerPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LedgerContent />
        </Suspense>
    );
}
