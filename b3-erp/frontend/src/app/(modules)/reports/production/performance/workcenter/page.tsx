'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ReportDetailPage } from '@/components/reports/ReportDetailPage';
import { ClickableTableRow } from '@/components/reports/ClickableTableRow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchDomainList } from '@/services/reports-data.service';

function WorkCenterContent() {
    const router = useRouter();

    const [workCenters, setWorkCenters] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const raw = await fetchDomainList<any>('production/work-center');
                const mapped = raw.map((r: any) => ({
                    id: r.workCenterCode ?? r.code ?? r.id,
                    name: r.workCenterName ?? r.name ?? '',
                    oee: Number(r.oee ?? 0),
                    availability: Number(r.availability ?? 0),
                    performance: Number(r.performance ?? 0),
                    quality: Number(r.quality ?? 0),
                    status: r.status ?? '',
                }));
                if (!cancelled) setWorkCenters(mapped);
            } catch (e) {
                if (!cancelled) { setLoadError(e instanceof Error ? e.message : 'Failed to load'); setWorkCenters([]); }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    return (
        <ReportDetailPage
            title="Work Center Performance"
            description="Detailed OEE metrics by work center"
            breadcrumbs={[
                { label: 'Reports', href: '/reports' },
                { label: 'Production', href: '/reports' },
                { label: 'Performance', href: '/reports/production/performance' },
                { label: 'Work Centers' }
            ]}
        >
            {isLoading && <div className="mb-3 rounded border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">Loading…</div>}
            {loadError && !isLoading && <div className="mb-3 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{loadError}</div>}
            <Card>
                <CardHeader>
                    <CardTitle>Work Center Metrics</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Work Center ID</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">OEE</th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Availability</th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quality</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {workCenters.map((wc) => (
                                <ClickableTableRow
                                    key={wc.id}
                                    onClick={() => router.push(`/production/work-centers/${wc.id}`)}
                                >
                                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-blue-600">{wc.id}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{wc.name}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-right font-bold">{wc.oee}%</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-500">{wc.availability}%</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-500">{wc.performance}%</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-500">{wc.quality}%</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${wc.status === 'Active' ? 'bg-green-100 text-green-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {wc.status}
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

export default function WorkCenterPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <WorkCenterContent />
        </Suspense>
    );
}
