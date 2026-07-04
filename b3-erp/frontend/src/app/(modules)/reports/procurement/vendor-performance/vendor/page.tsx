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

function VendorPOsDetailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const vendorId = searchParams.get('vendor') || 'all';
    const vendorName = 'Steel Suppliers Ltd'; // In real app, fetch from vendorId

    const [posData, setPosData] = useState<any[]>([]);
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
                    date: r.poDate ?? '',
                    items: Number((r.items?.length) ?? r.itemCount ?? 0),
                    amount: Number(r.totalAmount ?? 0),
                    status: r.status ?? '',
                    dueDate: r.deliveryDate ?? r.expectedDate ?? '',
                }));
                if (!cancelled) setPosData(mapped);
            } catch (e) {
                if (!cancelled) { setLoadError(e instanceof Error ? e.message : 'Failed to load'); setPosData([]); }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const handlePOClick = (poId: string) => {
        router.push(`/procurement/po/${poId}`);
    };

    const getStatusColor = (status: string) => {
        const colors = {
            'Draft': 'bg-gray-600',
            'Approved': 'bg-blue-600',
            'In Transit': 'bg-orange-600',
            'Received': 'bg-green-600',
            'Cancelled': 'bg-red-600',
        };
        return colors[status as keyof typeof colors] || 'bg-gray-600';
    };

    return (
        <ReportDetailPage
            title={`Purchase Orders - ${vendorName}`}
            description={`All purchase orders for ${vendorName}`}
            breadcrumbs={[
                { label: 'Reports', href: '/reports' },
                { label: 'Procurement', href: '/reports' },
                { label: 'Vendor Performance', href: '/reports/procurement/vendor-performance' },
                { label: vendorName },
            ]}
            onBack={() => router.back()}
            onExport={() => exportToCsv('vendor-performance', posData)}
        >
            {isLoading && <div className="mb-3 rounded border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">Loading…</div>}
            {loadError && !isLoading && <div className="mb-3 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{loadError}</div>}
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-gray-600">Total POs</p>
                        <p className="text-2xl font-bold text-blue-600">3</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-gray-600">Total Value</p>
                        <p className="text-2xl font-bold text-green-600">₹10.5L</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-gray-600">On-Time Delivery</p>
                        <p className="text-2xl font-bold text-green-600">95%</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-gray-600">Avg PO Value</p>
                        <p className="text-2xl font-bold">₹3.5L</p>
                    </CardContent>
                </Card>
            </div>

            {/* POs Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Purchase Orders</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">PO #</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Items</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Due Date</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Status</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {posData.map((po) => (
                                <ClickableTableRow
                                    key={po.id}
                                    onClick={() => handlePOClick(po.id)}
                                >
                                    <td className="px-4 py-3 text-sm font-medium text-blue-600">{po.id}</td>
                                    <td className="px-4 py-3 text-sm">{po.date}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{po.items}</td>
                                    <td className="px-4 py-3 text-sm">{po.dueDate}</td>
                                    <td className="px-4 py-3 text-center">
                                        <Badge className={getStatusColor(po.status)}>
                                            {po.status}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right font-semibold text-green-600">
                                        ₹{(po.amount / 1000).toFixed(0)}K
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

export default function VendorPOsDetail() {
    return (
        <Suspense fallback={<div>Loading vendor POs...</div>}>
            <VendorPOsDetailContent />
        </Suspense>
    );
}
