'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ReportDetailPage } from '@/components/reports/ReportDetailPage';
import { exportToCsv } from '@/lib/export';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClickableTableRow } from '@/components/reports/ClickableTableRow';
import { Badge } from '@/components/ui/badge';
import { fetchDomainList } from '@/services/reports-data.service';

export default function PLRevenueDetail() {
    const router = useRouter();
    const [category] = useState('all'); // Get from URL params in real implementation

    const [revenueData, setRevenueData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const raw = await fetchDomainList<any>('finance/invoices?invoiceType=Sales Invoice');
                const mapped = (Array.isArray(raw) ? raw : []).map((r: any) => ({
                    id: r.id ?? r.invoiceNumber ?? '',
                    date: r.invoiceDate ? String(r.invoiceDate).slice(0, 10) : '',
                    customer: r.partyName ?? '',
                    category: r.invoiceType ?? 'Sales Invoice',
                    amount: Number(r.totalAmount ?? 0),
                    invoice: r.invoiceNumber ?? r.id ?? '',
                }));
                if (!cancelled) setRevenueData(mapped);
            } catch (e) {
                if (!cancelled) { setLoadError(e instanceof Error ? e.message : 'Failed to load'); setRevenueData([]); }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const totalRevenue = revenueData.reduce((s, r) => s + Number(r.amount || 0), 0);
    const avgInvoice = revenueData.length ? totalRevenue / revenueData.length : 0;

    const handleInvoiceClick = (invoiceId: string) => {
        router.push(`/sales/invoices/${invoiceId}`);
    };

    return (
        <ReportDetailPage
            title="Revenue Breakdown"
            description="Detailed revenue transactions"
            breadcrumbs={[
                { label: 'Reports', href: '/reports' },
                { label: 'Finance', href: '/reports' },
                { label: 'Profit & Loss', href: '/reports/finance/pl' },
                { label: 'Revenue' },
            ]}
            onBack={() => router.back()}
            onExport={() => exportToCsv('pl-revenue', revenueData)}
        >
            {isLoading && <div className="mb-3 rounded border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">Loading…</div>}
            {loadError && !isLoading && <div className="mb-3 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{loadError}</div>}
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-gray-600">Total Revenue</p>
                        <p className="text-2xl font-bold text-green-600">₹{(totalRevenue / 1000).toFixed(0)}K</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-gray-600">Invoices</p>
                        <p className="text-2xl font-bold">{revenueData.length}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-gray-600">Avg Invoice</p>
                        <p className="text-2xl font-bold">₹{(avgInvoice / 1000).toFixed(0)}K</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-gray-600">Invoices</p>
                        <p className="text-2xl font-bold text-blue-600">{revenueData.length}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Revenue Transactions Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Revenue Transactions</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Invoice</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Customer</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Category</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {revenueData.map((item) => (
                                <ClickableTableRow
                                    key={item.id}
                                    onClick={() => handleInvoiceClick(item.id)}
                                >
                                    <td className="px-4 py-3 text-sm">{item.date}</td>
                                    <td className="px-4 py-3 text-sm font-medium text-blue-600">{item.invoice}</td>
                                    <td className="px-4 py-3 text-sm">{item.customer}</td>
                                    <td className="px-4 py-3 text-sm">
                                        <Badge variant="outline">{item.category}</Badge>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right font-semibold text-green-600">
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
