'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ReportDetailPage } from '@/components/reports/ReportDetailPage';
import { exportToCsv } from '@/lib/export';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClickableTableRow } from '@/components/reports/ClickableTableRow';
import { Badge } from '@/components/ui/badge';

export default function ProductPerformanceDetail() {
    const router = useRouter();

    const products = [
        { id: 'PROD-001', name: 'Industrial Server Rack', produced: 150, rejected: 2, oee: 88, cycleTime: '45m' },
        { id: 'PROD-002', name: 'Cooling Unit', produced: 85, rejected: 5, oee: 72, cycleTime: '1h 20m' },
        { id: 'PROD-003', name: 'Power Distribution Unit', produced: 320, rejected: 1, oee: 94, cycleTime: '15m' },
    ];

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
