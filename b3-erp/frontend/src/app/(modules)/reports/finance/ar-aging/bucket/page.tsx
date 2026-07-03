'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ReportDetailPage } from '@/components/reports/ReportDetailPage';
import { exportToCsv } from '@/lib/export';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClickableTableRow } from '@/components/reports/ClickableTableRow';
import { Badge } from '@/components/ui/badge';

import { Suspense } from 'react';

function ARAgingBucketDetailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const bucket = searchParams.get('bucket') || '0-30';

    const invoicesData = [
        { id: 'INV-2025-045', customer: 'ABC Manufacturing Ltd', invoiceDate: '2025-01-15', dueDate: '2025-02-14', amount: 125000, age: 15, status: 'Current' },
        { id: 'INV-2025-038', customer: 'XYZ Industries Inc', invoiceDate: '2025-01-10', dueDate: '2025-02-09', amount: 85000, age: 20, status: 'Current' },
        { id: 'INV-2025-032', customer: 'Tech Solutions Pvt', invoiceDate: '2025-01-05', dueDate: '2025-02-04', amount: 65000, age: 25, status: 'Current' },
    ];

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
            onExport={() => exportToCsv('ar-aging-bucket', invoicesData)}
        >
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-gray-600">Total Amount</p>
                        <p className="text-2xl font-bold text-blue-600">₹2.75L</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-gray-600">Invoices</p>
                        <p className="text-2xl font-bold">3</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-gray-600">Avg Age</p>
                        <p className="text-2xl font-bold text-orange-600">20 days</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-gray-600">Customers</p>
                        <p className="text-2xl font-bold">3</p>
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
                            {invoicesData.map((item) => (
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
