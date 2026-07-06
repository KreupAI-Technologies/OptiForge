'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, ClipboardCheck, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import ClickableKPICard from '@/components/reports/ClickableKPICard';
import { fetchReportDataset } from '@/services/reports-management.service';

interface QualityDashboardData {
    totalInspections: number;
    passRate: number;
    openNCRs: number;
    activeCAPAs: number;
    qualityCost: number;
    defectRate: number;
    byInspectionType: { type: string; count: number; passed: number; failed: number }[];
    ncrBySeverity: { severity: string; count: number }[];
    capas: { number: string; issue: string; status: string; progress: number }[];
    defectTrend: { month: string; defects: number }[];
}

const DEFAULT_DATA: QualityDashboardData = {
    totalInspections: 186,
    passRate: 94.5,
    openNCRs: 8,
    activeCAPAs: 5,
    qualityCost: 45000,
    defectRate: 1.8,
    byInspectionType: [
        { type: 'Incoming', count: 54, passed: 51, failed: 3 },
        { type: 'In-Process', count: 76, passed: 73, failed: 3 },
        { type: 'Final', count: 42, passed: 39, failed: 3 },
        { type: 'Audit', count: 14, passed: 13, failed: 1 },
    ],
    ncrBySeverity: [
        { severity: 'Critical', count: 2 },
        { severity: 'Major', count: 3 },
        { severity: 'Minor', count: 3 },
    ],
    capas: [
        { number: 'CAPA-2025-005', issue: 'Dimensional variance in frames', status: 'In Progress', progress: 75 },
        { number: 'CAPA-2025-004', issue: 'Coating thickness issue', status: 'In Progress', progress: 60 },
        { number: 'CAPA-2025-003', issue: 'Welding defects', status: 'Verification', progress: 90 },
    ],
    defectTrend: [
        { month: 'Jan', defects: 12 },
        { month: 'Feb', defects: 10 },
        { month: 'Mar', defects: 8 },
        { month: 'Apr', defects: 7 },
        { month: 'May', defects: 6 },
    ],
};

export default function QualityDashboardReport() {
    const router = useRouter();
    const [period, setPeriod] = useState('this-month');

    const [data, setData] = useState<QualityDashboardData>(DEFAULT_DATA);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const payload = await fetchReportDataset<Partial<QualityDashboardData>>('quality.dashboard');
                if (cancelled) return;
                if (payload) {
                    setData({
                        totalInspections: Number(payload.totalInspections ?? DEFAULT_DATA.totalInspections),
                        passRate: Number(payload.passRate ?? DEFAULT_DATA.passRate),
                        openNCRs: Number(payload.openNCRs ?? DEFAULT_DATA.openNCRs),
                        activeCAPAs: Number(payload.activeCAPAs ?? DEFAULT_DATA.activeCAPAs),
                        qualityCost: Number(payload.qualityCost ?? DEFAULT_DATA.qualityCost),
                        defectRate: Number(payload.defectRate ?? DEFAULT_DATA.defectRate),
                        byInspectionType: Array.isArray(payload.byInspectionType) ? payload.byInspectionType : DEFAULT_DATA.byInspectionType,
                        ncrBySeverity: Array.isArray(payload.ncrBySeverity) ? payload.ncrBySeverity : DEFAULT_DATA.ncrBySeverity,
                        capas: Array.isArray(payload.capas) ? payload.capas : DEFAULT_DATA.capas,
                        defectTrend: Array.isArray(payload.defectTrend) ? payload.defectTrend : DEFAULT_DATA.defectTrend,
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
                    <h1 className="text-3xl font-bold mb-2">Quality Dashboard Report</h1>
                    <p className="text-gray-600">Quality metrics and performance overview</p>
                </div>
                <div className="flex gap-2">
                    <select value={period} onChange={(e) => setPeriod(e.target.value)} className="px-4 py-2 border rounded-lg">
                        <option value="this-month">This Month</option>
                        <option value="this-quarter">This Quarter</option>
                        <option value="this-year">This Year</option>
                    </select>
                    <Button variant="outline"><Download className="mr-2 h-4 w-4" />Export</Button>
                </div>
            </div>

            {isLoading && <p className="text-xs text-gray-400 mb-2">Loading latest figures…</p>}
            {loadError && <p className="text-xs text-amber-600 mb-2">Showing sample data — {loadError}</p>}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                <ClickableKPICard
                    title="Pass Rate"
                    value={`${data.passRate}%`}
                    subtext={`${data.totalInspections} inspections`}
                    icon={CheckCircle}
                    color="green"
                    trend="+1.2%"
                    trendUp={true}
                    onClick={() => router.push('/reports/quality/inspections')}
                />
                <ClickableKPICard
                    title="Open NCRs"
                    value={data.openNCRs.toString()}
                    subtext="Non-conformances"
                    icon={AlertTriangle}
                    color="red"
                    trend="-2"
                    trendUp={true}
                    onClick={() => router.push('/reports/quality/ncr-capa?status=Open')}
                />
                <ClickableKPICard
                    title="Active CAPAs"
                    value={data.activeCAPAs.toString()}
                    subtext="In progress"
                    icon={ClipboardCheck}
                    color="blue"
                    onClick={() => router.push('/reports/quality/ncr-capa?status=In Progress')}
                />
                <ClickableKPICard
                    title="Quality Cost"
                    value={`$${(data.qualityCost / 1000).toFixed(0)}K`}
                    subtext="Rework + scrap"
                    icon={TrendingUp}
                    color="orange"
                    trend="-5%"
                    trendUp={true}
                    onClick={() => console.log('Navigate to Cost of Quality')}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
                <Card>
                    <CardHeader><CardTitle>Inspections by Type</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {data.byInspectionType.map((item, idx) => {
                                const passRate = (item.passed / item.count) * 100;
                                return (
                                    <div
                                        key={idx}
                                        className="cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                                        onClick={() => router.push(`/reports/quality/inspections/type?type=${item.type}`)}
                                    >
                                        <div className="flex justify-between mb-2">
                                            <span className="font-medium">{item.type}</span>
                                            <div className="text-sm">
                                                <span className="text-green-600 font-semibold">{item.passed} passed</span>
                                                <span className="text-gray-400 mx-1">/</span>
                                                <span className="text-red-600">{item.failed} failed</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 bg-gray-200 rounded-full h-3">
                                                <div className="bg-green-600 h-3 rounded-full" style={{ width: `${passRate}%` }} />
                                            </div>
                                            <span className="text-sm font-semibold">{passRate.toFixed(1)}%</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>NCRs by Severity</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {data.ncrBySeverity.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between p-3 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                    style={{
                                        backgroundColor: item.severity === 'Critical' ? '#fee2e2' : item.severity === 'Major' ? '#fed7aa' : '#fef3c7'
                                    }}
                                    onClick={() => router.push(`/reports/quality/ncr-capa/severity?severity=${item.severity}`)}
                                >
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className={`h-5 w-5 ${item.severity === 'Critical' ? 'text-red-600' : item.severity === 'Major' ? 'text-orange-600' : 'text-yellow-600'}`} />
                                        <span className="font-medium">{item.severity}</span>
                                    </div>
                                    <Badge className={item.severity === 'Critical' ? 'bg-red-600' : item.severity === 'Major' ? 'bg-orange-600' : 'bg-yellow-600'}>
                                        {item.count} NCRs
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="mb-3">
                <CardHeader><CardTitle>Active CAPAs Progress</CardTitle></CardHeader>
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
                                        <span className="font-medium">{capa.number}</span>
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

            <Card>
                <CardHeader><CardTitle>Defect Trend (Last 5 Months)</CardTitle></CardHeader>
                <CardContent>
                    <div className="flex items-end justify-between gap-2 h-48">
                        {data.defectTrend.map((item, idx) => (
                            <div key={idx} className="flex-1 flex flex-col items-center">
                                <div className="w-full flex flex-col items-center justify-end flex-1">
                                    <span className="text-xs font-semibold mb-1">{item.defects}</span>
                                    <div
                                        className="w-full bg-gradient-to-t from-red-600 to-red-400 rounded-t"
                                        style={{ height: `${(item.defects / 12) * 100}%` }}
                                    />
                                </div>
                                <span className="text-xs text-gray-600 mt-2">{item.month}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center justify-center gap-2 mt-4 text-green-600">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-sm font-medium">50% reduction in defects over 5 months</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
