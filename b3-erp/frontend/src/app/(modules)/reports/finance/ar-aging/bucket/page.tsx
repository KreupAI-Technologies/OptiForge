'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ReportDetailPage } from '@/components/reports/ReportDetailPage';
import { exportToCsv } from '@/lib/export';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClickableTableRow } from '@/components/reports/ClickableTableRow';
import { Badge } from '@/components/ui/badge';
import { fetchReportRows } from '@/services/reports-management.service';

import { Suspense } from 'react';

interface InvoiceRow {
    id: string;
    customer: string;
    invoiceDate: string;
    dueDate: string;
    amount: number;
    age: number;
    status: string;
}

function ARAgingBucketDetailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const bucket = searchParams.get('bucket') || '0-30';

    const [invoicesData, setInvoicesData] = useState<InvoiceRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const rows = await fetchReportRows<Partial<InvoiceRow>>('finance.ar-aging.bucket');
                const mapped: InvoiceRow[] = (Array.isArray(rows) ? rows : []).map((r) => ({
                    id: String(r.id ?? ''),
                    customer: String(r.customer ?? ''),
                    invoiceDate: String(r.invoiceDate ?? ''),
                    dueDate: String(r.dueDate ?? ''),
                    amount: Number(r.amount ?? 0),
                    age: Number(r.age ?? 0),
                    status: String(r.status ?? ''),
                }));
                if (!cancelled) setInvoicesData(mapped);
            } catch (err) {
                if (!cancelled) {
                    setLoadError(err instanceof Error ? err.message : 'Failed to load invoices');
                    setInvoicesData([]);
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, []);

    const handleInvoiceClick = (invoiceId: string) => {
        router.push(`/sales/invoices/${invoiceId}`);
    };

    return (
        <ReportDetailPage
            title={`AR Aging: ${bucket} Days`}
            description="Invoices in this aging bucket"
            breadcrumbs={[
                { label: 'Reports', href: '/reports' },
                { label: 'Finance', href: '/reports' },
                { label: 'AR Aging', href: '/reports/finance/ar-aging' },
                { label: `${bucket} Days` },
            ]}
            onBack={() => router.back()}
            onExport={() => exportToCsv('ar-aging-bucket', invoicesData as unknown as Record<string, unknown>[])}
        >
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-gray-600">Total Amount</p>
                        <p className="text-2xl font-bold text-blue-600">₹{(invoicesData.reduce((s, i) => s + i.amount, 0) / 100000).toFixed(2)}L</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-gray-600">Invoices</p>
                        <p className="text-2xl font-bold">{invoicesData.length}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-gray-600">Avg Age</p>
                        <p className="text-2xl font-bold text-orange-600">{invoicesData.length ? Math.round(invoicesData.reduce((s, i) => s + i.age, 0) / invoicesData.length) : 0} days</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-gray-600">Customers</p>
                        <p className="text-2xl font-bold">{new Set(invoicesData.map((i) => i.customer)).size}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Invoices Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Outstanding Invoices</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Invoice</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Customer</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Invoice Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Due Date</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Age</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {isLoading && (
                                <tr><td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500">Loading invoices…</td></tr>
                            )}
                            {!isLoading && loadError && (
                                <tr><td colSpan={6} className="px-4 py-6 text-center text-sm text-red-600">{loadError}</td></tr>
                            )}
                            {!isLoading && !loadError && invoicesData.length === 0 && (
                                <tr><td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500">No invoices in this bucket.</td></tr>
                            )}
                            {!isLoading && !loadError && invoicesData.map((item) => (
                                <ClickableTableRow
                                    key={item.id}
                                    onClick={() => handleInvoiceClick(item.id)}
                                >
                                    <td className="px-4 py-3 text-sm font-medium text-blue-600">{item.id}</td>
                                    <td className="px-4 py-3 text-sm">{item.customer}</td>
                                    <td className="px-4 py-3 text-sm">{item.invoiceDate}</td>
                                    <td className="px-4 py-3 text-sm">{item.dueDate}</td>
                                    <td className="px-4 py-3 text-center">
                                        <Badge variant="outline">{item.age} days</Badge>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right font-semibold">
                                        ₹{(item.amount / 1000).toFixed(0)}K
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

export default function ARAgingBucketDetail() {
    return (
        <Suspense fallback={<div>Loading aging bucket...</div>}>
            <ARAgingBucketDetailContent />
        </Suspense>
    );
}
