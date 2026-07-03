'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ReportDetailPage } from '@/components/reports/ReportDetailPage';
import { exportToCsv } from '@/lib/export';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClickableTableRow } from '@/components/reports/ClickableTableRow';

export default function MaterialConsumptionDetail() {
    const router = useRouter();

    const materials = [
        { id: 'MAT-001', name: 'Steel Sheet 2mm', consumed: 1500, uom: 'Kg', cost: 120000, variance: 5 },
        { id: 'MAT-002', name: 'Aluminum Profile', consumed: 850, uom: 'm', cost: 250000, variance: -2 },
        { id: 'MAT-003', name: 'Paint - Industrial Grey', consumed: 200, uom: 'L', cost: 85000, variance: 8 },
    ];

    return (
        <ReportDetailPage
            title="Material Consumption"
            description="Consumption analysis by material"
            breadcrumbs={[
                { label: 'Reports', href: '/reports' },
                { label: 'Production', href: '/reports' },
                { label: 'Consumption', href: '/reports/production/material-consumption' },
                { label: 'Materials' },
            ]}
            onBack={() => router.back()}
            onExport={() => exportToCsv('material-consumption-material', materials)}
        >
            <Card>
                <CardHeader><CardTitle>Material Usage</CardTitle></CardHeader>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Material</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Consumed Qty</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Total Cost</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Variance %</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {materials.map((mat) => (
                                <ClickableTableRow
                                    key={mat.id}
                                    onClick={() => router.push(`/inventory/items/${mat.id}`)}
                                >
                                    <td className="px-4 py-3 text-sm font-medium text-blue-600">{mat.name}</td>
                                    <td className="px-4 py-3 text-right text-sm">{mat.consumed} {mat.uom}</td>
                                    <td className="px-4 py-3 text-right text-sm font-bold">₹{mat.cost.toLocaleString()}</td>
                                    <td className={`px-4 py-3 text-right text-sm ${mat.variance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        {mat.variance > 0 ? '+' : ''}{mat.variance}%
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
