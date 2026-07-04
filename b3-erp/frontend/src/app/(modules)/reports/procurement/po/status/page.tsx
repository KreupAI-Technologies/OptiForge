'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ReportDetailPage } from '@/components/reports/ReportDetailPage';
import { exportToCsv } from '@/lib/export';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClickableTableRow } from '@/components/reports/ClickableTableRow';
import { Badge } from '@/components/ui/badge';
import { fetchDomainList } from '@/services/reports-data.service';

import { Suspense } from 'react';

function POStatusDetailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const status = searchParams.get('status') || 'All';

    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const raw = await fetchDomainList<any>('procurement/purchase-orders');
                const mapped = raw.map((r: any) => ({
                    id: r.poNumber ?? r.id,
                    vendor: r.vendorName ?? '',
                    date: r.poDate ?? '',
                    amount: Number(r.totalAmount ?? 0),
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
            {isLoading && <div className="mb-3 rounded border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">Loading…</div>}
            {loadError && !isLoading && <div className="mb-3 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{loadError}</div>}
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
