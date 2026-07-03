'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ReportDetailPage } from '@/components/reports/ReportDetailPage';
import { exportToCsv } from '@/lib/export';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClickableTableRow } from '@/components/reports/ClickableTableRow';

export default function WOConsumptionDetail() {
    const router = useRouter();

    const orders = [
        { id: 'WO-2025-001', product: 'Server Rack', materialCost: 45000, variance: 1200 },
        { id: 'WO-2025-002', product: 'Cooling Unit', materialCost: 28000, variance: -500 },
        { id: 'WO-2025-003', product: 'PDU', materialCost: 15000, variance: 0 },
    ];

    return (
        <ReportDetailPage
            title="Consumption by Work Order"
            description="Material cost analysis per work order"
            breadcrumbs={[
                { label: 'Reports', href: '/reports' },
                { label: 'Production', href: '/reports' },
                { label: 'Consumption', href: '/reports/production/material-consumption' },
                { label: 'Work Orders' },
            ]}
            onBack={() => router.back()}
            onExport={() => exportToCsv('material-consumption-wo', orders)}
        >
            <Card>
                <CardHeader><CardTitle>Work Order Costs</CardTitle></CardHeader>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Work Order</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Product</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Material Cost</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Variance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {orders.map((wo) => (
                                <ClickableTableRow
                                    key={wo.id}
                                    onClick={() => router.push(`/production/work-orders/view/${wo.id}`)}
                                >
                                    <td className="px-4 py-3 text-sm font-medium text-blue-600">{wo.id}</td>
                                    <td className="px-4 py-3 text-sm">{wo.product}</td>
                                    <td className="px-4 py-3 text-right text-sm font-bold">₹{wo.materialCost.toLocaleString()}</td>
                                    <td className={`px-4 py-3 text-right text-sm ${wo.variance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        {wo.variance > 0 ? '+' : ''}₹{Math.abs(wo.variance)}
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
