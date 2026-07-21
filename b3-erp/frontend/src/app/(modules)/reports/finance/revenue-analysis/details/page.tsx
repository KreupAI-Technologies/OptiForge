'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ReportDetailPage } from '@/components/reports/ReportDetailPage';
import { fetchDomainList } from '@/services/reports-data.service';
import { exportToCsv } from '@/lib/export';
import { ClickableTableRow } from '@/components/reports/ClickableTableRow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function RevenueDetailsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const product = searchParams.get('product') || 'Unknown Product';

    const [invoices, setInvoices] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true); setLoadError(null);
            try {
                const raw = await fetchDomainList<any>('finance/invoices');
                const mapped = raw.map((r: any) => ({ id: r.invoiceNumber ?? r.id, date: r.invoiceDate ?? '', customer: r.partyName ?? '', amount: Number(r.totalAmount ?? 0), status: r.status ?? '' }));
                if (!cancelled) setInvoices(mapped);
            } catch (e) {
                if (!cancelled) { setLoadError(e instanceof Error ? e.message : 'Failed to load'); setInvoices([]); }
            } finally { if (!cancelled) setIsLoading(false); }
        })();
        return () => { cancelled = true; };
    }, []);

    return (
        <ReportDetailPage
            title={`Revenue Details: ${product}`}
            description={`Sales invoices for ${product}`}
            breadcrumbs={[
                { label: 'Reports', href: '/reports' },
                { label: 'Finance', href: '/reports' },
                { label: 'Revenue Analysis', href: '/reports/finance/revenue-analysis' },
                { label: 'Details' }
            ]}
            onBack={() => router.back()}
            onExport={() => exportToCsv(`revenue-details-${product}`, invoices)}
        >
            {isLoading && <div className="mb-3 rounded border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">Loading…</div>}
            {loadError && !isLoading && <div className="mb-3 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{loadError}</div>}
            <Card>
                <CardHeader>
                    <CardTitle>Sales Invoices</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {invoices.map((inv) => (
                                <ClickableTableRow
                                    key={inv.id}
                                    onClick={() => router.push(`/sales/invoices/${inv.id}`)}
                                >
                                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-blue-600">{inv.id}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{inv.date}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{inv.customer}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-900">
                                        ₹{inv.amount.toLocaleString()}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-center text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${inv.status === 'Paid' ? 'bg-green-100 text-green-800' :
                                                inv.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                            }`}>
                                            {inv.status}
                                        </span>
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

export default function RevenueDetailsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <RevenueDetailsContent />
        </Suspense>
    );
}
