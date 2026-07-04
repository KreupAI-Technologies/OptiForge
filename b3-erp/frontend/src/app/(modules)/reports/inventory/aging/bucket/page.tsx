'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ReportDetailPage } from '@/components/reports/ReportDetailPage';
import { ClickableTableRow } from '@/components/reports/ClickableTableRow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchDomainList } from '@/services/reports-data.service';

function AgingBucketContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const bucket = searchParams.get('bucket') || 'All';

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
                    stock: Number(r.quantity ?? 0),
                    value: Number(r.value ?? r.totalValue ?? 0),
                    age: Number(r.ageDays ?? 0),
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
            title={`Aging Bucket: ${bucket}`}
            description={`Inventory items in the ${bucket} aging category`}
            breadcrumbs={[
                { label: 'Reports', href: '/reports' },
                { label: 'Inventory', href: '/reports' },
                { label: 'Stock Aging', href: '/reports/inventory/aging' },
                { label: bucket }
            ]}
        >
            {isLoading && <div className="mb-3 rounded border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">Loading…</div>}
            {loadError && !isLoading && <div className="mb-3 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{loadError}</div>}
            <Card>
                <CardHeader>
                    <CardTitle>Items in {bucket}</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item ID</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Age (Days)</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {items.map((item) => (
                                <ClickableTableRow
                                    key={item.id}
                                    onClick={() => router.push(`/inventory/items/${item.id}`)}
                                >
                                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-blue-600">{item.id}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{item.name}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-right font-medium">
                                        {item.stock} {item.unit}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-right font-medium">
                                        ${item.value.toLocaleString()}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-center text-gray-500">
                                        {item.age}
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

export default function AgingBucketPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AgingBucketContent />
        </Suspense>
    );
}
