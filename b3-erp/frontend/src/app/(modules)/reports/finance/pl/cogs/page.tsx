'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ReportDetailPage } from '@/components/reports/ReportDetailPage';
import { fetchDomainList } from '@/services/reports-data.service';
import { exportToCsv } from '@/lib/export';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClickableTableRow } from '@/components/reports/ClickableTableRow';
import { Badge } from '@/components/ui/badge';

export default function PLCOGSDetail() {
    const router = useRouter();

    const [cogsData, setCogsData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true); setLoadError(null);
            try {
                const raw = await fetchDomainList<any>('finance/journal-entries');
                const mapped = raw.map((r: any) => ({ id: r.entryNumber ?? r.id, date: r.entryDate ?? '', category: r.entryType ?? '', item: r.narration ?? '', quantity: 0, amount: Number(r.totalDebit ?? 0) }));
                if (!cancelled) setCogsData(mapped);
            } catch (e) {
                if (!cancelled) { setLoadError(e instanceof Error ? e.message : 'Failed to load'); setCogsData([]); }
            } finally { if (!cancelled) setIsLoading(false); }
        })();
        return () => { cancelled = true; };
    }, []);

    return (
        <ReportDetailPage
            title="Cost of Goods Sold Breakdown"
            description="Detailed COGS transactions"
            breadcrumbs={[
                { label: 'Reports', href: '/reports' },
                { label: 'Finance', href: '/reports' },
                { label: 'Profit & Loss', href: '/reports/finance/pl' },
                { label: 'COGS' },
            ]}
            onBack={() => router.back()}
            onExport={() => exportToCsv('pl-cogs', cogsData)}
        >
            {isLoading && <div className="mb-3 rounded border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">Loading…</div>}
            {loadError && !isLoading && <div className="mb-3 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{loadError}</div>}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-gray-600">Total COGS</p>
                        <p className="text-2xl font-bold text-red-600">₹13L</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-gray-600">Materials</p>
                        <p className="text-2xl font-bold">₹7.3L</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-gray-600">Labor</p>
                        <p className="text-2xl font-bold">₹4.5L</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-gray-600">Overhead</p>
                        <p className="text-2xl font-bold">₹1.2L</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader><CardTitle>COGS Transactions</CardTitle></CardHeader>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Category</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Item</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {cogsData.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm">{item.date}</td>
                                    <td className="px-4 py-3 text-sm">
                                        <Badge variant="outline">{item.category}</Badge>
                                    </td>
                                    <td className="px-4 py-3 text-sm font-medium">{item.item}</td>
                                    <td className="px-4 py-3 text-sm text-right font-semibold text-red-600">
                                        ₹{(item.amount / 1000).toFixed(0)}K
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </ReportDetailPage>
    );
}
