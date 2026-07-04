'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ReportDetailPage } from '@/components/reports/ReportDetailPage';
import { ClickableTableRow } from '@/components/reports/ClickableTableRow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchDomainList } from '@/services/reports-data.service';

function StockCategoryContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const status = searchParams.get('status');
    const title = status ? `Stock by Category (${status})` : 'Stock by Category';

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
                    category: r.category ?? '',
                    stock: Number(r.quantity ?? r.availableQty ?? 0),
                    unit: r.uom ?? r.unit ?? '',
                    status: r.status ?? '',
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

    const filteredItems = status
        ? items.filter(item => {
            if (status === 'Low') return item.status === 'Low Stock';
            if (status === 'Critical') return item.status === 'Out of Stock';
            return true;
        })
        : items;

    return (
        <ReportDetailPage
            title={title}
            description="Detailed stock breakdown by category"
            breadcrumbs={[
                { label: 'Reports', href: '/reports' },
                { label: 'Inventory', href: '/reports' },
                { label: 'Stock Summary', href: '/reports/inventory/stock' },
                { label: 'Category' }
            ]}
        >
            {isLoading && <div className="mb-3 rounded border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">Loading…</div>}
            {loadError && !isLoading && <div className="mb-3 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{loadError}</div>}
            <Card>
                <CardHeader>
                    <CardTitle>Item List</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item ID</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredItems.map((item) => (
                                <ClickableTableRow
                                    key={item.id}
                                    onClick={() => router.push(`/inventory/items/${item.id}`)}
                                >
                                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-blue-600">{item.id}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{item.name}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-right font-medium">
                                        {item.stock} {item.unit}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.status === 'In Stock' ? 'bg-green-100 text-green-800' :
                                                item.status === 'Low Stock' ? 'bg-orange-100 text-orange-800' :
                                                    'bg-red-100 text-red-800'
                                            }`}>
                                            {item.status}
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

export default function StockCategoryPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <StockCategoryContent />
        </Suspense>
    );
}
