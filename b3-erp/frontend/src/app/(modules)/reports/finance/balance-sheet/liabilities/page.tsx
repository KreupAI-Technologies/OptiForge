'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ReportDetailPage } from '@/components/reports/ReportDetailPage';
import { fetchDomainList } from '@/services/reports-data.service';
import { ClickableTableRow } from '@/components/reports/ClickableTableRow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function LiabilitiesDetailContent() {
    const router = useRouter();

    const [liabilities, setLiabilities] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true); setLoadError(null);
            try {
                const raw = await fetchDomainList<any>('finance/chart-of-accounts');
                const mapped = raw.filter((a: any) => String(a.accountType ?? '').toLowerCase().includes('liab')).map((a: any) => ({ id: a.accountCode ?? a.id, name: a.accountName ?? '', type: a.accountType ?? '', balance: Number(a.currentBalance ?? a.balance ?? 0) }));
                if (!cancelled) setLiabilities(mapped);
            } catch (e) {
                if (!cancelled) { setLoadError(e instanceof Error ? e.message : 'Failed to load'); setLiabilities([]); }
            } finally { if (!cancelled) setIsLoading(false); }
        })();
        return () => { cancelled = true; };
    }, []);

    return (
        <ReportDetailPage
            title="Liabilities Breakdown"
            description="Detailed view of liability accounts"
            breadcrumbs={[
                { label: 'Reports', href: '/reports' },
                { label: 'Finance', href: '/reports' },
                { label: 'Balance Sheet', href: '/reports/finance/balance-sheet' },
                { label: 'Liabilities' }
            ]}
        >
            {isLoading && <div className="mb-3 rounded border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">Loading…</div>}
            {loadError && !isLoading && <div className="mb-3 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{loadError}</div>}
            <Card>
                <CardHeader>
                    <CardTitle>Liability Accounts</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Code</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Name</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {liabilities.map((liability) => (
                                <ClickableTableRow
                                    key={liability.id}
                                    onClick={() => router.push(`/accounts/ledger/${liability.id}`)}
                                >
                                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-blue-600">{liability.id}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{liability.name}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{liability.type}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-right font-medium">
                                        ₹{liability.balance.toLocaleString()}
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

export default function LiabilitiesDetailPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LiabilitiesDetailContent />
        </Suspense>
    );
}
