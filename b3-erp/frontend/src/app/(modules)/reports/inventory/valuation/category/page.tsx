'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ReportDetailPage } from '@/components/reports/ReportDetailPage';
import { exportToCsv } from '@/lib/export';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClickableTableRow } from '@/components/reports/ClickableTableRow';

export default function ValuationByCategoryDetail() {
    const router = useRouter();

    const categories = [
        { id: 'CAT-RAW', name: 'Raw Materials', items: 450, value: 2500000, turnover: 4.5 },
        { id: 'CAT-WIP', name: 'Work in Progress', items: 120, value: 1800000, turnover: 12.0 },
        { id: 'CAT-FG', name: 'Finished Goods', items: 85, value: 3200000, turnover: 6.2 },
        { id: 'CAT-SPA', name: 'Spare Parts', items: 200, value: 500000, turnover: 1.5 },
    ];

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
