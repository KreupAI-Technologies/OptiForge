'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ReportDetailPage } from '@/components/reports/ReportDetailPage';
import { exportToCsv } from '@/lib/export';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClickableTableRow } from '@/components/reports/ClickableTableRow';
import { fetchDomainList } from '@/services/reports-data.service';

export default function SpendCategoryDetail() {
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
                const raw = await fetchDomainList<any>('procurement/categories');
                const mapped = raw.map((r: any) => ({
                    id: r.categoryCode ?? r.id,
                    name: r.categoryName ?? r.name ?? '',
                    spend: Number(r.totalSpend ?? r.spend ?? 0),
                    budget: Number(r.budget ?? 0),
                    variance: Number(r.variance ?? 0),
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
            title="Spend by Category"
            description="Procurement spend analysis by category"
            breadcrumbs={[
                { label: 'Reports', href: '/reports' },
                { label: 'Procurement', href: '/reports' },
                { label: 'Spend Analysis', href: '/reports/procurement/spend-analysis' },
                { label: 'Categories' },
            ]}
            onBack={() => router.back()}
            onExport={() => exportToCsv('procurement-spend-analysis-category', categories)}
        >
            {isLoading && <div className="mb-3 rounded border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">Loading…</div>}
            {loadError && !isLoading && <div className="mb-3 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{loadError}</div>}
            <Card>
                <CardHeader><CardTitle>Category Spend</CardTitle></CardHeader>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Category</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Total Spend</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Budget</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Variance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {categories.map((cat) => (
                                <ClickableTableRow
                                    key={cat.id}
                                    onClick={() => router.push(`/reports/procurement/po/status?category=${cat.id}`)}
                                >
                                    <td className="px-4 py-3 text-sm font-medium text-blue-600">{cat.name}</td>
                                    <td className="px-4 py-3 text-right text-sm font-bold">₹{cat.spend.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-right text-sm">₹{cat.budget.toLocaleString()}</td>
                                    <td className={`px-4 py-3 text-right text-sm ${cat.variance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        {cat.variance > 0 ? '+' : ''}₹{cat.variance.toLocaleString()}
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
