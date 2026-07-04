'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ReportDetailPage } from '@/components/reports/ReportDetailPage';
import { ClickableTableRow } from '@/components/reports/ClickableTableRow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchDomainList } from '@/services/reports-data.service';

function SalespersonContent() {
    const router = useRouter();

    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const raw = await fetchDomainList<any>('api/v1/sales/orders');
                const mapped = raw.map((r: any) => ({
                    id: r.orderNumber ?? r.id,
                    date: r.orderDate ?? '',
                    customer: r.customerName ?? '',
                    value: Number(r.totalAmount ?? r.grandTotal ?? 0),
                    status: r.status ?? '',
                }));
                if (!cancelled) setOrders(mapped);
            } catch (e) {
                if (!cancelled) { setLoadError(e instanceof Error ? e.message : 'Failed to load'); setOrders([]); }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    return (
        <ReportDetailPage
            title="Salesperson Performance"
            description="Detailed order history for salesperson"
            breadcrumbs={[
                { label: 'Reports', href: '/reports' },
                { label: 'Sales', href: '/reports' },
                { label: 'Performance', href: '/reports/sales/performance' },
                { label: 'Salesperson' }
            ]}
        >
            {isLoading && <div className="mb-3 rounded border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">Loading…</div>}
            {loadError && !isLoading && <div className="mb-3 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{loadError}</div>}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {orders.map((order) => (
                                <ClickableTableRow
                                    key={order.id}
                                    onClick={() => router.push(`/sales/orders/${order.id}`)}
                                >
                                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-blue-600">{order.id}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{order.date}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{order.customer}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-right font-medium">₹{(order.value / 1000).toFixed(0)}K</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                                order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {order.status}
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

export default function SalespersonPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SalespersonContent />
        </Suspense>
    );
}
