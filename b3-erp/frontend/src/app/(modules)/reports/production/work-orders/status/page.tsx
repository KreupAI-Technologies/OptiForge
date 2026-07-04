'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ReportDetailPage } from '@/components/reports/ReportDetailPage';
import { ClickableTableRow } from '@/components/reports/ClickableTableRow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchDomainList } from '@/services/reports-data.service';

function WorkOrdersStatusContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const status = searchParams.get('status') || 'All';

    const [workOrders, setWorkOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const raw = await fetchDomainList<any>('production/work-order');
                const mapped = raw.map((r: any) => ({
                    id: r.workOrderNumber ?? r.woNumber ?? r.id,
                    product: r.productName ?? r.itemName ?? '',
                    quantity: Number(r.quantity ?? r.plannedQty ?? 0),
                    startDate: r.startDate ?? r.plannedStartDate ?? '',
                    dueDate: r.dueDate ?? r.plannedEndDate ?? '',
                    status: r.status ?? '',
                }));
                if (!cancelled) setWorkOrders(mapped);
            } catch (e) {
                if (!cancelled) { setLoadError(e instanceof Error ? e.message : 'Failed to load'); setWorkOrders([]); }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const filteredWOs = status === 'All'
        ? workOrders
        : workOrders.filter(wo => {
            if (status === 'Active') return wo.status === 'In Progress' || wo.status === 'Delayed';
            return wo.status === status;
        });

    return (
        <ReportDetailPage
            title={`Work Orders: ${status}`}
            description={`List of work orders with status: ${status}`}
            breadcrumbs={[
                { label: 'Reports', href: '/reports' },
                { label: 'Production', href: '/reports' },
                { label: 'Work Orders', href: '/reports/production/work-orders' },
                { label: status }
            ]}
        >
            {isLoading && <div className="mb-3 rounded border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">Loading…</div>}
            {loadError && !isLoading && <div className="mb-3 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{loadError}</div>}
            <Card>
                <CardHeader>
                    <CardTitle>Work Order List</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">WO ID</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredWOs.map((wo) => (
                                <ClickableTableRow
                                    key={wo.id}
                                    onClick={() => router.push(`/production/work-orders/view/${wo.id}`)}
                                >
                                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-blue-600">{wo.id}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{wo.product}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-right font-medium">{wo.quantity}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{wo.startDate}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{wo.dueDate}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${wo.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                                wo.status === 'Delayed' ? 'bg-red-100 text-red-800' :
                                                    wo.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {wo.status}
                                        </span>
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

export default function WorkOrdersStatusPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <WorkOrdersStatusContent />
        </Suspense>
    );
}
