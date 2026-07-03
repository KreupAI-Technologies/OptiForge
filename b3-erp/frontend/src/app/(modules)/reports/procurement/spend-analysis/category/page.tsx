'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ReportDetailPage } from '@/components/reports/ReportDetailPage';
import { exportToCsv } from '@/lib/export';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClickableTableRow } from '@/components/reports/ClickableTableRow';

export default function SpendCategoryDetail() {
    const router = useRouter();

    const categories = [
        { id: 'CAT-001', name: 'Raw Materials', spend: 2500000, budget: 2200000, variance: -300000 },
        { id: 'CAT-002', name: 'Office Supplies', spend: 150000, budget: 200000, variance: 50000 },
        { id: 'CAT-003', name: 'Logistics', spend: 450000, budget: 400000, variance: -50000 },
        { id: 'CAT-004', name: 'Maintenance', spend: 120000, budget: 150000, variance: 30000 },
    ];

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
