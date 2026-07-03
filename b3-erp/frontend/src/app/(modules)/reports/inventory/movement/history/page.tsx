'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ReportDetailPage } from '@/components/reports/ReportDetailPage';
import { exportToCsv } from '@/lib/export';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClickableTableRow } from '@/components/reports/ClickableTableRow';
import { Badge } from '@/components/ui/badge';

export default function MovementHistoryDetail() {
    const router = useRouter();

    const movements = [
        { id: 'ST-2025-001', type: 'Transfer', date: '2025-01-22', items: 2, from: 'Warehouse A', to: 'Warehouse B', status: 'Completed' },
        { id: 'GRN-2025-089', type: 'Receipt', date: '2025-01-20', items: 5, from: 'Vendor', to: 'Warehouse A', status: 'Completed' },
        { id: 'DO-2025-045', type: 'Delivery', date: '2025-01-18', items: 3, from: 'Warehouse B', to: 'Customer', status: 'Shipped' },
        { id: 'ADJ-2025-012', type: 'Adjustment', date: '2025-01-15', items: 1, from: 'Warehouse A', to: 'Scrap', status: 'Approved' },
    ];

    return (
        <ReportDetailPage
            title="Movement History"
            description="Recent stock movements and transfers"
            breadcrumbs={[
                { label: 'Reports', href: '/reports' },
                { label: 'Inventory', href: '/reports' },
                { label: 'Movement', href: '/reports/inventory/movement' },
                { label: 'History' },
            ]}
            onBack={() => router.back()}
            onExport={() => exportToCsv('inventory-movement-history', movements)}
        >
            <Card>
                <CardHeader><CardTitle>Recent Movements</CardTitle></CardHeader>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Ref #</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Type</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Route</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {movements.map((mov) => (
                                <ClickableTableRow
                                    key={mov.id}
                                    onClick={() => router.push(mov.type === 'Transfer' ? `/inventory/transfers/view/${mov.id}` : '#')}
                                >
                                    <td className="px-4 py-3 text-sm font-medium text-blue-600">{mov.id}</td>
                                    <td className="px-4 py-3 text-sm">{mov.type}</td>
                                    <td className="px-4 py-3 text-sm">{mov.date}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{mov.from} → {mov.to}</td>
                                    <td className="px-4 py-3 text-center">
                                        <Badge variant="outline">{mov.status}</Badge>
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
