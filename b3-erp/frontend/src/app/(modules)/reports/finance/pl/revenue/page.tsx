'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ReportDetailPage } from '@/components/reports/ReportDetailPage';
import { exportToCsv } from '@/lib/export';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClickableTableRow } from '@/components/reports/ClickableTableRow';
import { Badge } from '@/components/ui/badge';

export default function PLRevenueDetail() {
    const router = useRouter();
    const [category] = useState('all'); // Get from URL params in real implementation

    const revenueData = [
        { id: 'INV-2025-001', date: '2025-01-20', customer: 'ABC Manufacturing Ltd', category: 'Product Sales', amount: 450000, invoice: 'INV-2025-001' },
        { id: 'INV-2025-002', date: '2025-01-18', customer: 'XYZ Industries Inc', category: 'Product Sales', amount: 385000, invoice: 'INV-2025-002' },
        { id: 'INV-2025-003', date: '2025-01-15', customer: 'Tech Solutions Pvt', category: 'Services', amount: 125000, invoice: 'INV-2025-003' },
        { id: 'INV-2025-004', date: '2025-01-12', customer: 'Global Exports Corp', category: 'Product Sales', amount: 520000, invoice: 'INV-2025-004' },
    ];

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
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-gray-600">Total Revenue</p>
                        <p className="text-2xl font-bold text-green-600">₹14.8L</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-gray-600">Invoices</p>
                        <p className="text-2xl font-bold">4</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-gray-600">Avg Invoice</p>
                        <p className="text-2xl font-bold">₹3.7L</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-gray-600">Top Category</p>
                        <p className="text-2xl font-bold text-blue-600">Product Sales</p>
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
