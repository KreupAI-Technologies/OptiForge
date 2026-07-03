'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ReportDetailPage } from '@/components/reports/ReportDetailPage';
import { exportToCsv } from '@/lib/export';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClickableTableRow } from '@/components/reports/ClickableTableRow';
import { Badge } from '@/components/ui/badge';

import { Suspense } from 'react';

function VendorOrdersDetailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const vendorId = searchParams.get('id');

    const orders = [
        { id: 'PO-2025-089', date: '2025-01-22', amount: 324500, status: 'Issued', delivery: 'On Time' },
        { id: 'PO-2025-075', date: '2024-12-15', amount: 280000, status: 'Received', delivery: 'Late' },
        { id: 'PO-2025-062', date: '2024-11-20', amount: 150000, status: 'Received', delivery: 'On Time' },
    ];

    return (
        <ReportDetailPage
            title="Vendor Order History"
            description="Purchase history for vendor"
            breadcrumbs={[
                { label: 'Reports', href: '/reports' },
                { label: 'Procurement', href: '/reports' },
                { label: 'Vendor Performance', href: '/reports/procurement/vendor-performance' },
                { label: 'Orders' },
            ]}
            onBack={() => router.back()}
            onExport={() => exportToCsv('vendor-performance-orders', orders)}
        >
            <Card>
                <CardHeader><CardTitle>Order History</CardTitle></CardHeader>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">PO #</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Status</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Delivery</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {orders.map((order) => (
                                <ClickableTableRow
                                    key={order.id}
                                    onClick={() => router.push(`/procurement/purchase-orders/view/${order.id}`)}
                                >
                                    <td className="px-4 py-3 text-sm font-medium text-blue-600">{order.id}</td>
                                    <td className="px-4 py-3 text-sm">{order.date}</td>
                                    <td className="px-4 py-3 text-center">
                                        <Badge variant="outline">{order.status}</Badge>
                                    </td>
                                    <td className="px-4 py-3 text-center text-sm">
                                        <span className={order.delivery === 'Late' ? 'text-red-600' : 'text-green-600'}>
                                            {order.delivery}
                                        </span>
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

export default function VendorOrdersDetail() {
    return (
        <Suspense fallback={<div>Loading orders...</div>}>
            <VendorOrdersDetailContent />
        </Suspense>
    );
}
