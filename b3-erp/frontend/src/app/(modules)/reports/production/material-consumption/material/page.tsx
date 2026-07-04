'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ReportDetailPage } from '@/components/reports/ReportDetailPage';
import { exportToCsv } from '@/lib/export';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClickableTableRow } from '@/components/reports/ClickableTableRow';
import { fetchDomainList } from '@/services/reports-data.service';

export default function MaterialConsumptionDetail() {
    const router = useRouter();

    const [materials, setMaterials] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const raw = await fetchDomainList<any>('production/material-requirements');
                const mapped = raw.map((r: any) => ({
                    id: r.id,
                    name: r.materialName ?? r.itemName ?? '',
                    consumed: Number(r.consumedQty ?? r.requiredQty ?? 0),
                    uom: r.uom ?? r.unit ?? '',
                    cost: Number(r.cost ?? 0),
                    variance: Number(r.variance ?? 0),
                }));
                if (!cancelled) setMaterials(mapped);
            } catch (e) {
                if (!cancelled) { setLoadError(e instanceof Error ? e.message : 'Failed to load'); setMaterials([]); }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

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
            {isLoading && <div className="mb-3 rounded border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">Loading…</div>}
            {loadError && !isLoading && <div className="mb-3 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{loadError}</div>}
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
