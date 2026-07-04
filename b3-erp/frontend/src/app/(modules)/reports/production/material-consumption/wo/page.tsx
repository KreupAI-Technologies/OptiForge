'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ReportDetailPage } from '@/components/reports/ReportDetailPage';
import { exportToCsv } from '@/lib/export';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClickableTableRow } from '@/components/reports/ClickableTableRow';
import { fetchDomainList } from '@/services/reports-data.service';

export default function WOConsumptionDetail() {
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
                const raw = await fetchDomainList<any>('production/work-order');
                const mapped = raw.map((r: any) => ({
                    id: r.workOrderNumber ?? r.id,
                    product: r.productName ?? r.itemName ?? '',
                    materialCost: Number(r.materialCost ?? 0),
                    variance: Number(r.variance ?? 0),
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
            title="Consumption by Work Order"
            description="Material cost analysis per work order"
            breadcrumbs={[
                { label: 'Reports', href: '/reports' },
                { label: 'Production', href: '/reports' },
                { label: 'Consumption', href: '/reports/production/material-consumption' },
                { label: 'Work Orders' },
            ]}
            onBack={() => router.back()}
            onExport={() => exportToCsv('material-consumption-wo', orders)}
        >
            {isLoading && <div className="mb-3 rounded border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">Loading…</div>}
            {loadError && !isLoading && <div className="mb-3 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{loadError}</div>}
            <Card>
                <CardHeader><CardTitle>Work Order Costs</CardTitle></CardHeader>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Work Order</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Product</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Material Cost</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Variance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {orders.map((wo) => (
                                <ClickableTableRow
                                    key={wo.id}
                                    onClick={() => router.push(`/production/work-orders/view/${wo.id}`)}
                                >
                                    <td className="px-4 py-3 text-sm font-medium text-blue-600">{wo.id}</td>
                                    <td className="px-4 py-3 text-sm">{wo.product}</td>
                                    <td className="px-4 py-3 text-right text-sm font-bold">₹{wo.materialCost.toLocaleString()}</td>
                                    <td className={`px-4 py-3 text-right text-sm ${wo.variance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        {wo.variance > 0 ? '+' : ''}₹{Math.abs(wo.variance)}
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
