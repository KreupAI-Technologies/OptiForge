'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, AlertTriangle, ClipboardCheck, CheckCircle } from 'lucide-react';
import ClickableKPICard from '@/components/reports/ClickableKPICard';
import ClickableTableRow from '@/components/reports/ClickableTableRow';
import { fetchReportDataset } from '@/services/reports-management.service';

interface NCRCAPAData {
    openNCRs: number;
    activeCAPAs: number;
    closedNCRs: number;
    closedCAPAs: number;
    ncrs: { number: string; issue: string; severity: string; status: string; age: number }[];
    capas: { number: string; issue: string; progress: number; status: string }[];
}

const DEFAULT_DATA: NCRCAPAData = {
    openNCRs: 8,
    activeCAPAs: 5,
    closedNCRs: 45,
    closedCAPAs: 28,
    ncrs: [
        { number: 'NCR-2025-008', issue: 'Dimensional variance', severity: 'Major', status: 'Open', age: 5 },
        { number: 'NCR-2025-007', issue: 'Surface defect', severity: 'Minor', status: 'CAPA Initiated', age: 8 },
        { number: 'NCR-2025-006', issue: 'Weld quality', severity: 'Critical', status: 'CAPA Initiated', age: 12 },
    ],
    capas: [
        { number: 'CAPA-2025-005', issue: 'Dimensional variance in frames', progress: 75, status: 'In Progress' },
        { number: 'CAPA-2025-004', issue: 'Coating thickness issue', progress: 60, status: 'In Progress' },
        { number: 'CAPA-2025-003', issue: 'Welding defects', progress: 90, status: 'Verification' },
    ],
};

export default function NCRCAPAReport() {
    const router = useRouter();

    const [data, setData] = useState<NCRCAPAData>(DEFAULT_DATA);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const payload = await fetchReportDataset<Partial<NCRCAPAData>>('quality.ncr-capa');
                if (cancelled) return;
                if (payload) {
                    setData({
                        openNCRs: Number(payload.openNCRs ?? DEFAULT_DATA.openNCRs),
                        activeCAPAs: Number(payload.activeCAPAs ?? DEFAULT_DATA.activeCAPAs),
                        closedNCRs: Number(payload.closedNCRs ?? DEFAULT_DATA.closedNCRs),
                        closedCAPAs: Number(payload.closedCAPAs ?? DEFAULT_DATA.closedCAPAs),
                        ncrs: Array.isArray(payload.ncrs) ? payload.ncrs : DEFAULT_DATA.ncrs,
                        capas: Array.isArray(payload.capas) ? payload.capas : DEFAULT_DATA.capas,
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
                    <h1 className="text-3xl font-bold mb-2">NCR & CAPA Detailed Report</h1>
                    <p className="text-gray-600">Non-conformance and corrective actions</p>
                </div>
                <Button variant="outline"><Download className="mr-2 h-4 w-4" />Export</Button>
            </div>

            {isLoading && <p className="text-xs text-gray-400 mb-2">Loading latest figures…</p>}
            {loadError && <p className="text-xs text-amber-600 mb-2">Showing sample data — {loadError}</p>}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                <ClickableKPICard
                    title="Open NCRs"
                    value={data.openNCRs.toString()}
                    icon={AlertTriangle}
                    color="red"
                    trend="+2"
                    trendUp={false}
                    onClick={() => router.push('/reports/quality/ncr-capa/status?status=Open')}
                />
                <ClickableKPICard
                    title="Active CAPAs"
                    value={data.activeCAPAs.toString()}
                    icon={ClipboardCheck}
                    color="blue"
                    onClick={() => router.push('/reports/quality/ncr-capa/status?status=In Progress')}
                />
                <ClickableKPICard
                    title="Closed NCRs"
                    value={data.closedNCRs.toString()}
                    icon={CheckCircle}
                    color="green"
                    onClick={() => router.push('/reports/quality/ncr-capa/status?status=Closed')}
                />
                <ClickableKPICard
                    title="Closed CAPAs"
                    value={data.closedCAPAs.toString()}
                    icon={CheckCircle}
                    color="green"
                    onClick={() => router.push('/reports/quality/ncr-capa/status?status=Closed')}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <Card>
                    <CardHeader><CardTitle>Open NCRs</CardTitle></CardHeader>
                    <CardContent className="p-0">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">NCR #</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Issue</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Severity</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Age</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {data.ncrs.map((ncr, idx) => (
                                    <ClickableTableRow
                                        key={idx}
                                        onClick={() => router.push(`/quality/ncr/${ncr.number}`)}
                                    >
                                        <td className="px-4 py-3 text-sm font-medium text-blue-600">{ncr.number}</td>
                                        <td className="px-4 py-3 text-sm">{ncr.issue}</td>
                                        <td className="px-4 py-3 text-center">
                                            <Badge className={ncr.severity === 'Critical' ? 'bg-red-600' : ncr.severity === 'Major' ? 'bg-orange-600' : 'bg-yellow-600'}>
                                                {ncr.severity}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-center text-sm">{ncr.age} days</td>
                                    </ClickableTableRow>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Active CAPAs</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {data.capas.map((capa, idx) => (
                                <div
                                    key={idx}
                                    className="border-b pb-4 last:border-0 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                                    onClick={() => router.push(`/quality/capa/${capa.number}`)}
                                >
                                    <div className="flex justify-between mb-2">
                                        <div>
                                            <span className="font-medium text-sm">{capa.number}</span>
                                            <p className="text-sm text-gray-600 mt-1">{capa.issue}</p>
                                        </div>
                                        <Badge variant="outline">{capa.status}</Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                                            <div className={`h-2 rounded-full ${capa.progress >= 90 ? 'bg-green-600' : capa.progress >= 70 ? 'bg-blue-600' : 'bg-orange-600'}`} style={{ width: `${capa.progress}%` }} />
                                        </div>
                                        <span className="text-sm font-semibold">{capa.progress}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
