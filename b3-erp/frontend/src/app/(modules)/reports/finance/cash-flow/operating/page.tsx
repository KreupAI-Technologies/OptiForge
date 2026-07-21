'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ReportDetailPage } from '@/components/reports/ReportDetailPage';
import { fetchDomainList } from '@/services/reports-data.service';
import { exportToCsv } from '@/lib/export';
import { ClickableTableRow } from '@/components/reports/ClickableTableRow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function OperatingActivitiesContent() {
    const router = useRouter();

    const [transactions, setTransactions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true); setLoadError(null);
            try {
                const raw = await fetchDomainList<any>('finance/payments');
                const mapped = raw.map((r: any) => ({ id: r.paymentNumber ?? r.id, paymentId: r.id, date: r.paymentDate ?? '', description: r.notes ?? r.partyName ?? '', category: r.paymentType ?? 'Operating', amount: Number(r.amount ?? 0) }));
                if (!cancelled) setTransactions(mapped);
            } catch (e) {
                if (!cancelled) { setLoadError(e instanceof Error ? e.message : 'Failed to load'); setTransactions([]); }
            } finally { if (!cancelled) setIsLoading(false); }
        })();
        return () => { cancelled = true; };
    }, []);

    return (
        <ReportDetailPage
            title="Operating Activities"
            description="Cash flow from core business operations"
            breadcrumbs={[
                { label: 'Reports', href: '/reports' },
                { label: 'Finance', href: '/reports' },
                { label: 'Cash Flow', href: '/reports/finance/cash-flow' },
                { label: 'Operating' }
            ]}
            onBack={() => router.back()}
            onExport={() => exportToCsv('cash-flow-operating', transactions)}
        >
            {isLoading && <div className="mb-3 rounded border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">Loading…</div>}
            {loadError && !isLoading && <div className="mb-3 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{loadError}</div>}
            <Card>
                <CardHeader>
                    <CardTitle>Operating Transactions</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {transactions.map((trx) => (
                                <ClickableTableRow
                                    key={trx.id}
                                    onClick={trx.paymentId ? () => router.push(`/finance/payments/view/${trx.paymentId}`) : undefined}
                                >
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{trx.date}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-blue-600">{trx.id}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{trx.description}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{trx.category}</td>
                                    <td className={`px-3 py-2 whitespace-nowrap text-sm text-right font-medium ${trx.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {trx.amount >= 0 ? '+' : ''}₹{Math.abs(trx.amount).toLocaleString()}
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

export default function OperatingActivitiesPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <OperatingActivitiesContent />
        </Suspense>
    );
}
