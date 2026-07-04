'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ReportDetailPage } from '@/components/reports/ReportDetailPage';
import { ClickableTableRow } from '@/components/reports/ClickableTableRow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchDomainList } from '@/services/reports-data.service';

function ServiceCallStatusContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const status = searchParams.get('status') || 'All';

    const [calls, setCalls] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const raw = await fetchDomainList<any>('after-sales/service-requests');
                const mapped = (Array.isArray(raw) ? raw : []).map((r: any) => ({
                    id: r.requestNumber ?? r.id ?? '',
                    customer: r.customerName ?? '',
                    issue: r.subject ?? r.description ?? '',
                    priority: r.priority ?? '',
                    assignedTo: r.assignedToName ?? r.assignedTo ?? '',
                    reported: r.reportedDate ? String(r.reportedDate).slice(0, 10) : (r.createdAt ? String(r.createdAt).slice(0, 10) : ''),
                    status: r.status ?? '',
                }));
                if (!cancelled) setCalls(mapped);
            } catch (e) {
                if (!cancelled) { setLoadError(e instanceof Error ? e.message : 'Failed to load'); setCalls([]); }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const filteredCalls = status === 'All'
        ? calls
        : calls.filter(c => c.status === status);

    return (
        <ReportDetailPage
            title={`Service Calls: ${status}`}
            description={`List of service calls with status: ${status}`}
            breadcrumbs={[
                { label: 'Reports', href: '/reports' },
                { label: 'After-Sales', href: '/reports' },
                { label: 'Service Calls', href: '/reports/after-sales/service-calls' },
                { label: status }
            ]}
        >
            {isLoading && <div className="mb-3 rounded border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">Loading…</div>}
            {loadError && !isLoading && <div className="mb-3 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{loadError}</div>}
            <Card>
                <CardHeader>
                    <CardTitle>Service Call List</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Call ID</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredCalls.map((call) => (
                                <ClickableTableRow
                                    key={call.id}
                                    onClick={() => router.push(`/after-sales/service-calls/${call.id}`)}
                                >
                                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-blue-600">{call.id}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{call.customer}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{call.issue}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                                        <Badge className={call.priority === 'Critical' ? 'bg-red-600' : call.priority === 'High' ? 'bg-orange-600' : call.priority === 'Medium' ? 'bg-blue-600' : 'bg-gray-600'}>
                                            {call.priority}
                                        </Badge>
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{call.assignedTo}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                                        <Badge variant={call.status === 'Open' ? 'destructive' : call.status === 'Resolved' ? 'default' : 'secondary'}>
                                            {call.status}
                                        </Badge>
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

export default function ServiceCallStatusPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ServiceCallStatusContent />
        </Suspense>
    );
}
