'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ReportDetailPage } from '@/components/reports/ReportDetailPage';
import { exportToCsv } from '@/lib/export';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClickableTableRow } from '@/components/reports/ClickableTableRow';
import { Badge } from '@/components/ui/badge';

export default function PLCOGSDetail() {
    const router = useRouter();

    const cogsData = [
        { id: 'MAT-001', date: '2025-01-22', category: 'Raw Materials', item: 'Steel Sheets', quantity: 450, amount: 450000 },
        { id: 'MAT-002', date: '2025-01-20', category: 'Raw Materials', item: 'Aluminum Rods', amount: 280000 },
        { id: 'LAB-001', date: '2025-01-22', category: 'Direct Labor', item: 'Production Workers', amount: 450000 },
        { id: 'OH-001', date: '2025-01-20', category: 'Manufacturing Overhead', item: 'Factory Utilities', amount: 120000 },
    ];

    return (
        <ReportDetailPage
            title="Cost of Goods Sold Breakdown"
            description="Detailed COGS transactions"
            breadcrumbs={[
                { label: 'Reports', href: '/reports' },
                { label: 'Finance', href: '/reports' },
                { label: 'Profit & Loss', href: '/reports/finance/pl' },
                { label: 'COGS' },
            ]}
            onBack={() => router.back()}
            onExport={() => exportToCsv('pl-cogs', cogsData)}
        >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-gray-600">Total COGS</p>
                        <p className="text-2xl font-bold text-red-600">₹13L</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-gray-600">Materials</p>
                        <p className="text-2xl font-bold">₹7.3L</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-gray-600">Labor</p>
                        <p className="text-2xl font-bold">₹4.5L</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-gray-600">Overhead</p>
                        <p className="text-2xl font-bold">₹1.2L</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader><CardTitle>COGS Transactions</CardTitle></CardHeader>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Category</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Item</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {cogsData.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm">{item.date}</td>
                                    <td className="px-4 py-3 text-sm">
                                        <Badge variant="outline">{item.category}</Badge>
                                    </td>
                                    <td className="px-4 py-3 text-sm font-medium">{item.item}</td>
                                    <td className="px-4 py-3 text-sm text-right font-semibold text-red-600">
                                        ₹{(item.amount / 1000).toFixed(0)}K
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </ReportDetailPage>
    );
}
