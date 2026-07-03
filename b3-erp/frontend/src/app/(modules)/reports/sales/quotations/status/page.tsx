'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ReportDetailPage } from '@/components/reports/ReportDetailPage';
import { ClickableTableRow } from '@/components/reports/ClickableTableRow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchReportRows } from '@/services/reports-management.service';

interface QuotationRow {
    id: string;
    date: string;
    customer: string;
    value: number;
    status: string;
}

function QuotationsStatusContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const status = searchParams.get('status') || 'All';

    const [quotations, setQuotations] = useState<QuotationRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const rows = await fetchReportRows<Partial<QuotationRow>>('sales.quotations.status');
                const mapped: QuotationRow[] = (Array.isArray(rows) ? rows : []).map((r) => ({
                    id: String(r.id ?? ''),
                    date: String(r.date ?? ''),
                    customer: String(r.customer ?? ''),
                    value: Number(r.value ?? 0),
                    status: String(r.status ?? ''),
                }));
                if (!cancelled) setQuotations(mapped);
            } catch (err) {
                if (!cancelled) {
                    setLoadError(err instanceof Error ? err.message : 'Failed to load quotations');
                    setQuotations([]);
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, []);

    const filteredQuotations = status === 'All'
        ? quotations
        : quotations.filter(q => q.status === status);

    return (
        <ReportDetailPage
            title={`Quotations: ${status}`}
            description={`List of quotations with status: ${status}`}
            breadcrumbs={[
                { label: 'Reports', href: '/reports' },
                { label: 'Sales', href: '/reports' },
                { label: 'Quotation Analysis', href: '/reports/sales/quotations' },
                { label: status }
            ]}
        >
            <Card>
                <CardHeader>
                    <CardTitle>Quotation List</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quote ID</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading && (
                                <tr><td colSpan={5} className="px-3 py-6 text-center text-sm text-gray-500">Loading quotations…</td></tr>
                            )}
                            {!isLoading && loadError && (
                                <tr><td colSpan={5} className="px-3 py-6 text-center text-sm text-red-600">{loadError}</td></tr>
                            )}
                            {!isLoading && !loadError && filteredQuotations.length === 0 && (
                                <tr><td colSpan={5} className="px-3 py-6 text-center text-sm text-gray-500">No quotations found.</td></tr>
                            )}
                            {!isLoading && !loadError && filteredQuotations.map((quote) => (
                                <ClickableTableRow
                                    key={quote.id}
                                    onClick={() => router.push(`/sales/quotations/${quote.id}`)}
                                >
                                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-blue-600">{quote.id}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{quote.date}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{quote.customer}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-right font-medium">₹{(quote.value / 1000).toFixed(0)}K</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${quote.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                                                quote.status === 'Sent' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-red-100 text-red-800'
                                            }`}>
                                            {quote.status}
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

export default function QuotationsStatusPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <QuotationsStatusContent />
        </Suspense>
    );
}
