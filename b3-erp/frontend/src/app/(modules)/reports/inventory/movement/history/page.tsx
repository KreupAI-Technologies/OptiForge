'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ReportDetailPage } from '@/components/reports/ReportDetailPage';
import { exportToCsv } from '@/lib/export';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClickableTableRow } from '@/components/reports/ClickableTableRow';
import { Badge } from '@/components/ui/badge';
import { fetchDomainList } from '@/services/reports-data.service';

export default function MovementHistoryDetail() {
    const router = useRouter();

    const [movements, setMovements] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const raw = await fetchDomainList<any>('inventory/stock-transfers');
                const mapped = raw.map((r: any) => ({
                    id: r.transferNumber ?? r.id,
                    type: 'Transfer',
                    date: r.transferDate ?? r.createdAt ?? '',
                    items: Number((r.items?.length) ?? r.itemCount ?? 0),
                    from: r.fromWarehouse ?? r.sourceWarehouse ?? '',
                    to: r.toWarehouse ?? r.destinationWarehouse ?? '',
                    status: r.status ?? '',
                }));
                if (!cancelled) setMovements(mapped);
            } catch (e) {
                if (!cancelled) { setLoadError(e instanceof Error ? e.message : 'Failed to load'); setMovements([]); }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

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
            {isLoading && <div className="mb-3 rounded border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">Loading…</div>}
            {loadError && !isLoading && <div className="mb-3 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{loadError}</div>}
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
