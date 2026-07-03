'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ReportDetailPage } from '@/components/reports/ReportDetailPage';
import { ClickableTableRow } from '@/components/reports/ClickableTableRow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchReportRows } from '@/services/reports-management.service';

interface OrderRow {
    id: string;
    date: string;
    customer: string;
    value: number;
    status: string;
}

function OrdersStatusContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const status = searchParams.get('status') || 'All';

    const [orders, setOrders] = useState<OrderRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const rows = await fetchReportRows<Partial<OrderRow>>('sales.orders.status');
                const mapped: OrderRow[] = (Array.isArray(rows) ? rows : []).map((r) => ({
                    id: String(r.id ?? ''),
                    date: String(r.date ?? ''),
                    customer: String(r.customer ?? ''),
                    value: Number(r.value ?? 0),
                    status: String(r.status ?? ''),
                }));
                if (!cancelled) setOrders(mapped);
            } catch (err) {
                if (!cancelled) {
                    setLoadError(err instanceof Error ? err.message : 'Failed to load orders');
                    setOrders([]);
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, []);

    const filteredOrders = status === 'All'
        ? orders
        : orders.filter(o => {
            if (status === 'Pending') return o.status === 'Pending' || o.status === 'Processing';
            return o.status === status;
        });

    return (
        <ReportDetailPage
            title={`Orders: ${status}`}
            description={`List of orders with status: ${status}`}
            breadcrumbs={[
                { label: 'Reports', href: '/reports' },
                { label: 'Sales', href: '/reports' },
                { label: 'Order Fulfillment', href: '/reports/sales/orders' },
                { label: status }
            ]}
        >
            <Card>
                <CardHeader>
                    <CardTitle>Order List</CardTitle>
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
                            {isLoading && (
                                <tr><td colSpan={5} className="px-3 py-6 text-center text-sm text-gray-500">Loading orders…</td></tr>
                            )}
                            {!isLoading && loadError && (
                                <tr><td colSpan={5} className="px-3 py-6 text-center text-sm text-red-600">{loadError}</td></tr>
                            )}
                            {!isLoading && !loadError && filteredOrders.length === 0 && (
                                <tr><td colSpan={5} className="px-3 py-6 text-center text-sm text-gray-500">No orders found.</td></tr>
                            )}
                            {!isLoading && !loadError && filteredOrders.map((order) => (
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
                                                order.status === 'Processing' || order.status === 'Pending' ? 'bg-orange-100 text-orange-800' :
                                                    'bg-blue-100 text-blue-800'
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

export default function OrdersStatusPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <OrdersStatusContent />
        </Suspense>
    );
}
