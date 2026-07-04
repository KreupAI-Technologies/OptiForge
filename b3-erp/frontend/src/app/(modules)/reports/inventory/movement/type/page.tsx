'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ReportDetailPage } from '@/components/reports/ReportDetailPage';
import { ClickableTableRow } from '@/components/reports/ClickableTableRow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchDomainList } from '@/services/reports-data.service';

function MovementTypeContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const type = searchParams.get('type');
    const title = type ? `Movement History: ${type}` : 'All Movement History';

    const [movements, setMovements] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const raw = await fetchDomainList<any>('inventory/stock-adjustments');
                const mapped = raw.map((r: any) => ({
                    id: r.adjustmentNumber ?? r.id,
                    date: r.adjustmentDate ?? r.createdAt ?? '',
                    item: r.itemName ?? '',
                    type: r.adjustmentType ?? r.reason ?? '',
                    quantity: Number(r.quantity ?? 0),
                    from: r.fromLocation ?? '',
                    to: r.toLocation ?? '',
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

    const filteredMovements = type
        ? movements.filter(m => m.type === type)
        : movements;

    return (
        <ReportDetailPage
            title={title}
            description="Detailed log of inventory movements"
            breadcrumbs={[
                { label: 'Reports', href: '/reports' },
                { label: 'Inventory', href: '/reports' },
                { label: 'Stock Movement', href: '/reports/inventory/movement' },
                { label: 'History' }
            ]}
        >
            {isLoading && <div className="mb-3 rounded border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">Loading…</div>}
            {loadError && !isLoading && <div className="mb-3 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{loadError}</div>}
            <Card>
                <CardHeader>
                    <CardTitle>Movement Log</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Movement ID</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From / To</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredMovements.map((m) => (
                                <ClickableTableRow
                                    key={m.id}
                                    onClick={() => router.push(`/inventory/movements/view/${m.id}`)}
                                >
                                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-blue-600">{m.id}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{m.date}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{m.item}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${m.type === 'Receipt' ? 'bg-green-100 text-green-800' :
                                                m.type === 'Issue' ? 'bg-orange-100 text-orange-800' :
                                                    'bg-blue-100 text-blue-800'
                                            }`}>
                                            {m.type}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-right font-medium">
                                        {m.quantity}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                        {m.from} → {m.to}
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

export default function MovementTypePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <MovementTypeContent />
        </Suspense>
    );
}
