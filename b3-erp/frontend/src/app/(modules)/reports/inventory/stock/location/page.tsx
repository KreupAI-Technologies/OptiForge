'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ReportDetailPage } from '@/components/reports/ReportDetailPage';
import { ClickableTableRow } from '@/components/reports/ClickableTableRow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchDomainList } from '@/services/reports-data.service';

function StockLocationContent() {
    const router = useRouter();

    const [items, setItems] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const raw = await fetchDomainList<any>('inventory/stock-balances');
                const mapped = raw.map((r: any) => ({
                    id: r.itemCode ?? r.id,
                    name: r.itemName ?? '',
                    location: r.warehouseName ?? r.location ?? '',
                    stock: Number(r.quantity ?? 0),
                    unit: r.uom ?? '',
                }));
                if (!cancelled) setItems(mapped);
            } catch (e) {
                if (!cancelled) { setLoadError(e instanceof Error ? e.message : 'Failed to load'); setItems([]); }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    return (
        <ReportDetailPage
            title="Stock by Location"
            description="Detailed stock breakdown by warehouse location"
            breadcrumbs={[
                { label: 'Reports', href: '/reports' },
                { label: 'Inventory', href: '/reports' },
                { label: 'Stock Summary', href: '/reports/inventory/stock' },
                { label: 'Location' }
            ]}
        >
            {isLoading && <div className="mb-3 rounded border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">Loading…</div>}
            {loadError && !isLoading && <div className="mb-3 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{loadError}</div>}
            <Card>
                <CardHeader>
                    <CardTitle>Location Stock List</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item ID</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {items.map((item, idx) => (
                                <ClickableTableRow
                                    key={idx}
                                    onClick={() => router.push(`/inventory/items/${item.id}`)}
                                >
                                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-blue-600">{item.id}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{item.name}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{item.location}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-right font-medium">
                                        {item.stock} {item.unit}
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

export default function StockLocationPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <StockLocationContent />
        </Suspense>
    );
}
