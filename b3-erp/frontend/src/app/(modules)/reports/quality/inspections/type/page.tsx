'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ReportDetailPage from '@/components/reports/ReportDetailPage';
import ClickableTableRow from '@/components/reports/ClickableTableRow';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle } from 'lucide-react';
import { fetchReportRows } from '@/services/reports-management.service';

interface InspectionRow {
    id: string;
    item: string;
    type: string;
    inspector: string;
    date: string;
    result: string;
    defects: number;
}

function InspectionByTypeContent() {
    const searchParams = useSearchParams();
    const type = searchParams.get('type') || 'All Types';

    const [inspections, setInspections] = useState<InspectionRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const rows = await fetchReportRows<Partial<InspectionRow>>('quality.inspections.type');
                const mapped: InspectionRow[] = (Array.isArray(rows) ? rows : []).map((r) => ({
                    id: String(r.id ?? ''),
                    item: String(r.item ?? ''),
                    type: String(r.type ?? ''),
                    inspector: String(r.inspector ?? ''),
                    date: String(r.date ?? ''),
                    result: String(r.result ?? ''),
                    defects: Number(r.defects ?? 0),
                }));
                if (!cancelled) setInspections(mapped);
            } catch (err) {
                if (!cancelled) {
                    setLoadError(err instanceof Error ? err.message : 'Failed to load inspections');
                    setInspections([]);
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, []);

    // Filter data
    const filteredData = type === 'All Types'
        ? inspections
        : inspections.filter(item => item.type === type);

    return (
        <ReportDetailPage
            title={`Inspections - ${type}`}
            description={`Detailed inspection records for ${type}`}
            breadcrumbs={[
                { label: 'Reports', href: '/reports' },
                { label: 'Quality', href: '/reports' },
                { label: 'Inspections', href: '/reports/quality/inspections' },
                { label: type }
            ]}
        >
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                            <tr>
                                <th className="px-3 py-2">Inspection ID</th>
                                <th className="px-3 py-2">Item</th>
                                <th className="px-3 py-2">Type</th>
                                <th className="px-3 py-2">Inspector</th>
                                <th className="px-3 py-2">Date</th>
                                <th className="px-3 py-2 text-center">Result</th>
                                <th className="px-3 py-2 text-center">Defects</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {isLoading && (
                                <tr><td colSpan={7} className="px-3 py-6 text-center text-sm text-gray-500">Loading inspections…</td></tr>
                            )}
                            {!isLoading && loadError && (
                                <tr><td colSpan={7} className="px-3 py-6 text-center text-sm text-red-600">{loadError}</td></tr>
                            )}
                            {!isLoading && !loadError && filteredData.length === 0 && (
                                <tr><td colSpan={7} className="px-3 py-6 text-center text-sm text-gray-500">No inspections found.</td></tr>
                            )}
                            {!isLoading && !loadError && filteredData.map((record) => (
                                <ClickableTableRow
                                    key={record.id}
                                    id={record.id}
                                    basePath="/quality/inspections/view"
                                >
                                    <td className="px-3 py-2 font-medium text-gray-900">{record.id}</td>
                                    <td className="px-3 py-2">{record.item}</td>
                                    <td className="px-3 py-2">{record.type}</td>
                                    <td className="px-3 py-2">{record.inspector}</td>
                                    <td className="px-3 py-2">{record.date}</td>
                                    <td className="px-3 py-2 text-center">
                                        <Badge className={record.result === 'Pass' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                            {record.result === 'Pass' ? (
                                                <div className="flex items-center gap-1">
                                                    <CheckCircle className="w-3 h-3" /> Pass
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1">
                                                    <XCircle className="w-3 h-3" /> Fail
                                                </div>
                                            )}
                                        </Badge>
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                        {record.defects > 0 ? (
                                            <span className="text-red-600 font-medium">{record.defects}</span>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>
                                </ClickableTableRow>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </ReportDetailPage>
    );
}

export default function InspectionByTypePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <InspectionByTypeContent />
        </Suspense>
    );
}
