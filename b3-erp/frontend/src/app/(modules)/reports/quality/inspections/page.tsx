'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, ClipboardCheck, CheckCircle, XCircle } from 'lucide-react';
import ClickableKPICard from '@/components/reports/ClickableKPICard';
import ClickableTableRow from '@/components/reports/ClickableTableRow';
import { fetchReportDataset } from '@/services/reports-management.service';
import { exportToCsv } from '@/lib/export';

interface InspectionResultsData {
    totalInspections: number;
    passed: number;
    failed: number;
    passRate: number;
    byType: { type: string; total: number; passed: number; failed: number; rate: number }[];
}

const EMPTY_DATA: InspectionResultsData = {
    totalInspections: 0,
    passed: 0,
    failed: 0,
    passRate: 0,
    byType: [],
};

export default function InspectionResultsReport() {
    const [data, setData] = useState<InspectionResultsData>(EMPTY_DATA);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const payload = await fetchReportDataset<Partial<InspectionResultsData>>('quality.inspections');
                if (cancelled) return;
                if (payload) {
                    setData({
                        totalInspections: Number(payload.totalInspections ?? 0),
                        passed: Number(payload.passed ?? 0),
                        failed: Number(payload.failed ?? 0),
                        passRate: Number(payload.passRate ?? 0),
                        byType: Array.isArray(payload.byType) ? payload.byType : [],
                    });
                }
            } catch (e) {
                if (!cancelled) setLoadError(e instanceof Error ? e.message : 'Failed to load report');
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    return (
        <div className="w-full p-3">
            <div className="flex justify-between items-center mb-3">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Inspection Results Report</h1>
                    <p className="text-gray-600">Quality inspection outcomes</p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => exportToCsv('quality-inspection-results-by-type', data.byType)}
                    disabled={data.byType.length === 0}
                >
                    <Download className="mr-2 h-4 w-4" />Export
                </Button>
            </div>

            {isLoading && <p className="text-xs text-gray-400 mb-2">Loading latest figures…</p>}
            {loadError && <p className="text-xs text-red-600 mb-2">Failed to load report — {loadError}</p>}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                <ClickableKPICard
                    title="Total Inspections"
                    value={data.totalInspections.toString()}
                    icon={ClipboardCheck}
                    color="blue"
                />
                <ClickableKPICard
                    title="Passed"
                    value={data.passed.toString()}
                    icon={CheckCircle}
                    color="green"
                />
                <ClickableKPICard
                    title="Failed"
                    value={data.failed.toString()}
                    icon={XCircle}
                    color="red"
                />
                <ClickableKPICard
                    title="Pass Rate"
                    value={`${data.passRate}%`}
                    icon={CheckCircle}
                    color="green"
                    trend="+0.5%"
                    trendUp={true}
                />
            </div>

            <Card>
                <CardHeader><CardTitle>Results by Inspection Type</CardTitle></CardHeader>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Type</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Total</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Passed</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Failed</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Pass Rate</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {!isLoading && data.byType.length === 0 && (
                                <tr><td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-400">No inspection data available</td></tr>
                            )}
                            {data.byType.map((type, idx) => (
                                <ClickableTableRow
                                    key={idx}
                                    basePath="/reports/quality/inspections/type"
                                    queryParam="type"
                                    id={type.type}
                                >
                                    <td className="px-4 py-3 text-sm font-medium">{type.type}</td>
                                    <td className="px-4 py-3 text-center"><Badge variant="outline">{type.total}</Badge></td>
                                    <td className="px-4 py-3 text-center text-green-600 font-semibold">{type.passed}</td>
                                    <td className="px-4 py-3 text-center text-red-600 font-semibold">{type.failed}</td>
                                    <td className="px-4 py-3 text-center"><span className="font-semibold text-green-600">{type.rate}%</span></td>
                                </ClickableTableRow>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}
