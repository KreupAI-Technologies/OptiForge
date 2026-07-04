'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ReportDetailPage } from '@/components/reports/ReportDetailPage';
import { exportToCsv } from '@/lib/export';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClickableTableRow } from '@/components/reports/ClickableTableRow';
import { Badge } from '@/components/ui/badge';
import { fetchDomainList } from '@/services/reports-data.service';

export default function ProductPerformanceDetail() {
    const router = useRouter();

    const [products, setProducts] = useState<any[]>([]);
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
                    name: r.productName ?? r.itemName ?? '',
                    produced: Number(r.producedQty ?? r.completedQty ?? 0),
                    rejected: Number(r.rejectedQty ?? 0),
                    oee: Number(r.oee ?? 0),
                    cycleTime: Number(r.cycleTime ?? 0),
                }));
                if (!cancelled) setProducts(mapped);
            } catch (e) {
                if (!cancelled) { setLoadError(e instanceof Error ? e.message : 'Failed to load'); setProducts([]); }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    return (
        <ReportDetailPage
            title="Production by Product"
            description="Performance metrics per product"
            breadcrumbs={[
                { label: 'Reports', href: '/reports' },
                { label: 'Production', href: '/reports' },
                { label: 'Performance', href: '/reports/production/performance' },
                { label: 'Products' },
            ]}
            onBack={() => router.back()}
            onExport={() => exportToCsv('production-performance-product', products)}
        >
            {isLoading && <div className="mb-3 rounded border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">Loading…</div>}
            {loadError && !isLoading && <div className="mb-3 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{loadError}</div>}
            <Card>
                <CardHeader><CardTitle>Product Metrics</CardTitle></CardHeader>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Product</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Produced</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Rejected</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">OEE</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Cycle Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {products.map((prod) => (
                                <ClickableTableRow
                                    key={prod.id}
                                    onClick={() => router.push(`/reports/production/work-orders/status?product=${prod.id}`)}
                                >
                                    <td className="px-4 py-3 text-sm font-medium text-blue-600">{prod.name}</td>
                                    <td className="px-4 py-3 text-center text-sm">{prod.produced}</td>
                                    <td className="px-4 py-3 text-center text-sm text-red-600">{prod.rejected}</td>
                                    <td className="px-4 py-3 text-center text-sm">
                                        <Badge variant={prod.oee >= 85 ? 'default' : 'secondary'} className={prod.oee >= 85 ? 'bg-green-600' : 'bg-orange-600'}>
                                            {prod.oee}%
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-right text-sm">{prod.cycleTime}</td>
                                </ClickableTableRow>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </ReportDetailPage>
    );
}
