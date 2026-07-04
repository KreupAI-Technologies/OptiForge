'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ReportDetailPage } from '@/components/reports/ReportDetailPage';
import { exportToCsv } from '@/lib/export';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClickableTableRow } from '@/components/reports/ClickableTableRow';
import { fetchDomainList } from '@/services/reports-data.service';

export default function ValuationByCategoryDetail() {
    const router = useRouter();

    const [categories, setCategories] = useState<any[]>([]);
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
                    name: r.category ?? r.itemName ?? '',
                    items: Number(r.quantity ?? 0),
                    value: Number(r.value ?? r.totalValue ?? 0),
                    turnover: Number(r.turnover ?? 0),
                }));
                if (!cancelled) setCategories(mapped);
            } catch (e) {
                if (!cancelled) { setLoadError(e instanceof Error ? e.message : 'Failed to load'); setCategories([]); }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    return (
        <ReportDetailPage
            title="Valuation by Category"
            description="Inventory value analysis by category"
            breadcrumbs={[
                { label: 'Reports', href: '/reports' },
                { label: 'Inventory', href: '/reports' },
                { label: 'Valuation', href: '/reports/inventory/valuation' },
                { label: 'Categories' },
            ]}
            onBack={() => router.back()}
            onExport={() => exportToCsv('inventory-valuation-category', categories)}
        >
            {isLoading && <div className="mb-3 rounded border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">Loading…</div>}
            {loadError && !isLoading && <div className="mb-3 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{loadError}</div>}
            <Card>
                <CardHeader><CardTitle>Category Valuation</CardTitle></CardHeader>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Category</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Item Count</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Turnover Rate</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Total Value</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {categories.map((cat) => (
                                <ClickableTableRow
                                    key={cat.id}
                                    onClick={() => router.push(`/reports/inventory/stock/category?id=${cat.id}`)}
                                >
                                    <td className="px-4 py-3 text-sm font-medium text-blue-600">{cat.name}</td>
                                    <td className="px-4 py-3 text-center text-sm">{cat.items}</td>
                                    <td className="px-4 py-3 text-center text-sm">{cat.turnover}x</td>
                                    <td className="px-4 py-3 text-right text-sm font-bold">₹{(cat.value / 100000).toFixed(2)}L</td>
                                </ClickableTableRow>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </ReportDetailPage>
    );
}
