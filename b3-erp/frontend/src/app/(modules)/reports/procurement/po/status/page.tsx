'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ReportDetailPage } from '@/components/reports/ReportDetailPage';
import { exportToCsv } from '@/lib/export';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClickableTableRow } from '@/components/reports/ClickableTableRow';
import { Badge } from '@/components/ui/badge';

import { Suspense } from 'react';

function POStatusDetailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const status = searchParams.get('status') || 'All';

    const orders = [
        { id: 'PO-2025-089', vendor: 'Steel Suppliers Ltd', date: '2025-01-22', amount: 324500, status: 'Issued' },
        { id: 'PO-2025-088', vendor: 'Office Depot', date: '2025-01-20', amount: 45000, status: 'Received' },
        { id: 'PO-2025-087', vendor: 'Logistics Partners', date: '2025-01-18', amount: 12000, status: 'Draft' },
        { id: 'PO-2025-086', vendor: 'Global Components', date: '2025-01-15', amount: 150000, status: 'Overdue' },
    ];

    const filteredOrders = status === 'All' ? orders : orders.filter(o => o.status === status);

    return (
        <ReportDetailPage
            title={`Purchase Orders - ${status}`}
            description={`List of ${status} purchase orders`}
            breadcrumbs={[
                { label: 'Reports', href: '/reports' },
                { label: 'Procurement', href: '/reports' },
                { label: 'Purchase Orders', href: '/reports/procurement/po' },
                { label: status },
            ]}
            onBack={() => router.back()}
            onExport={() => exportToCsv('procurement-po-status', filteredOrders)}
        >
            <Card>
                <CardHeader><CardTitle>Purchase Orders</CardTitle></CardHeader>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">PO #</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Vendor</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Status</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredOrders.map((order) => (
                                <ClickableTableRow
                                    key={order.id}
                                    onClick={() => router.push(`/procurement/purchase-orders/view/${order.id}`)}
                                >
                                    <td className="px-4 py-3 text-sm font-medium text-blue-600">{order.id}</td>
                                    <td className="px-4 py-3 text-sm">{order.vendor}</td>
                                    <td className="px-4 py-3 text-sm">{order.date}</td>
                                    <td className="px-4 py-3 text-center">
                                        <Badge variant="outline">{order.status}</Badge>
                                    </td>
                                    <td className="px-4 py-3 text-right text-sm font-bold">₹{order.amount.toLocaleString()}</td>
                                </ClickableTableRow>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </ReportDetailPage>
    );
}

export default function POStatusDetail() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <POStatusDetailContent />
        </Suspense>
    );
}
