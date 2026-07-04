'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ReportDetailPage from '@/components/reports/ReportDetailPage';
import ClickableTableRow from '@/components/reports/ClickableTableRow';
import { Badge } from '@/components/ui/badge';
import { fetchDomainList } from '@/services/reports-data.service';

function NCRByStatusContent() {
    const searchParams = useSearchParams();
    const status = searchParams.get('status') || 'All Statuses';

    const [ncrs, setNcrs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const raw = await fetchDomainList<any>('quality/ncr');
                const mapped = raw.map((r: any) => ({
                    id: r.ncrNumber ?? r.id,
                    issue: r.title ?? r.description ?? r.issue ?? '',
                    severity: r.severity ?? '',
                    status: r.status ?? '',
                    raisedBy: r.raisedBy ?? r.reportedBy ?? '',
                    date: r.raisedDate ?? r.createdAt ?? '',
                    age: Number(r.age ?? r.ageInDays ?? 0),
                }));
                if (!cancelled) setNcrs(mapped);
            } catch (e) {
                if (!cancelled) {
                    setLoadError(e instanceof Error ? e.message : 'Failed to load');
                    setNcrs([]);
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    // Filter data
    const filteredData = status === 'All Statuses'
        ? ncrs
        : ncrs.filter(item => item.status === status);

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'Critical': return 'bg-red-100 text-red-800';
            case 'Major': return 'bg-orange-100 text-orange-800';
            case 'Minor': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <ReportDetailPage
            title={`NCRs - ${status}`}
            description={`Non-conformance reports with status: ${status}`}
            breadcrumbs={[
                { label: 'Reports', href: '/reports' },
                { label: 'Quality', href: '/reports' },
                { label: 'NCR & CAPA', href: '/reports/quality/ncr-capa' },
                { label: status }
            ]}
        >
            <>
            {isLoading && <div className="mb-3 rounded border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">Loading…</div>}
            {loadError && !isLoading && <div className="mb-3 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{loadError}</div>}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                            <tr>
                                <th className="px-3 py-2">NCR ID</th>
                                <th className="px-3 py-2">Issue</th>
                                <th className="px-3 py-2">Severity</th>
                                <th className="px-3 py-2">Raised By</th>
                                <th className="px-3 py-2">Date</th>
                                <th className="px-3 py-2 text-center">Age (Days)</th>
                                <th className="px-3 py-2 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredData.map((record) => (
                                <ClickableTableRow
                                    key={record.id}
                                    id={record.id}
                                    basePath="/quality/ncr/view"
                                >
                                    <td className="px-3 py-2 font-medium text-gray-900">{record.id}</td>
                                    <td className="px-3 py-2">{record.issue}</td>
                                    <td className="px-3 py-2">
                                        <Badge className={getSeverityColor(record.severity)}>
                                            {record.severity}
                                        </Badge>
                                    </td>
                                    <td className="px-3 py-2">{record.raisedBy}</td>
                                    <td className="px-3 py-2">{record.date}</td>
                                    <td className="px-3 py-2 text-center">{record.age}</td>
                                    <td className="px-3 py-2 text-center">
                                        <Badge variant="outline">
                                            {record.status}
                                        </Badge>
                                    </td>
                                </ClickableTableRow>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            </>
        </ReportDetailPage>
    );
}

export default function NCRByStatusPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <NCRByStatusContent />
        </Suspense>
    );
}
