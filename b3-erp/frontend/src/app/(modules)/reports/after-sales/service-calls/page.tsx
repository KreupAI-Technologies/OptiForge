'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Wrench, Clock, CheckCircle } from 'lucide-react';
import { ClickableKPICard } from '@/components/reports/ClickableKPICard';
import { fetchReportDataset } from '@/services/reports-management.service';

interface ServiceCallsData {
    totalCalls: number;
    openCalls: number;
    avgResolutionTime: number;
    firstTimeFix: number;
    byPriority: { priority: string; count: number; avgTime: number }[];
    byStatus: { status: string; count: number }[];
}

const DEFAULT_DATA: ServiceCallsData = {
    totalCalls: 186,
    openCalls: 24,
    avgResolutionTime: 4.5,
    firstTimeFix: 82.5,
    byPriority: [
        { priority: 'Critical', count: 12, avgTime: 2.1 },
        { priority: 'High', count: 45, avgTime: 3.8 },
        { priority: 'Medium', count: 82, avgTime: 5.2 },
        { priority: 'Low', count: 47, avgTime: 6.8 },
    ],
    byStatus: [
        { status: 'Open', count: 24 },
        { status: 'In Progress', count: 18 },
        { status: 'Resolved', count: 132 },
        { status: 'Closed', count: 12 },
    ],
};

export default function ServiceCallReport() {
    const router = useRouter();
    const [period, setPeriod] = useState('this-month');

    const [data, setData] = useState<ServiceCallsData>(DEFAULT_DATA);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const payload = await fetchReportDataset<Partial<ServiceCallsData>>('after-sales.service-calls');
                if (cancelled) return;
                if (payload) {
                    setData({
                        totalCalls: Number(payload.totalCalls ?? DEFAULT_DATA.totalCalls),
                        openCalls: Number(payload.openCalls ?? DEFAULT_DATA.openCalls),
                        avgResolutionTime: Number(payload.avgResolutionTime ?? DEFAULT_DATA.avgResolutionTime),
                        firstTimeFix: Number(payload.firstTimeFix ?? DEFAULT_DATA.firstTimeFix),
                        byPriority: Array.isArray(payload.byPriority) ? payload.byPriority : DEFAULT_DATA.byPriority,
                        byStatus: Array.isArray(payload.byStatus) ? payload.byStatus : DEFAULT_DATA.byStatus,
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
                    <h1 className="text-3xl font-bold mb-2">Service Call Report</h1>
                    <p className="text-gray-600">Service request tracking and metrics</p>
                </div>
                <div className="flex gap-2">
                    <select value={period} onChange={(e) => setPeriod(e.target.value)} className="px-4 py-2 border rounded-lg">
                        <option value="this-month">This Month</option>
                        <option value="this-quarter">This Quarter</option>
                    </select>
                    <Button variant="outline"><Download className="mr-2 h-4 w-4" />Export</Button>
                </div>
            </div>

            {isLoading && <p className="text-xs text-gray-400 mb-2">Loading latest figures…</p>}
            {loadError && <p className="text-xs text-amber-600 mb-2">Showing sample data — {loadError}</p>}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                <ClickableKPICard
                    title="Total Service Calls"
                    value={data.totalCalls.toString()}
                    color="blue"
                    onClick={() => router.push('/reports/after-sales/service-calls/status?status=All')}
                />
                <ClickableKPICard
                    title="Open Calls"
                    value={data.openCalls.toString()}
                    color="orange"
                    onClick={() => router.push('/reports/after-sales/service-calls/status?status=Open')}
                />
                <ClickableKPICard
                    title="Avg Resolution Time"
                    value={data.avgResolutionTime.toString()}
                    color="purple"
                    description="Hours"
                />
                <ClickableKPICard
                    title="First-Time Fix Rate"
                    value={`${data.firstTimeFix}%`}
                    color="green"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <Card>
                    <CardHeader><CardTitle>Calls by Priority</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {data.byPriority.map((item, idx) => (
                                <div key={idx}>
                                    <div className="flex justify-between mb-2">
                                        <Badge className={item.priority === 'Critical' ? 'bg-red-600' : item.priority === 'High' ? 'bg-orange-600' : item.priority === 'Medium' ? 'bg-blue-600' : 'bg-gray-600'}>{item.priority}</Badge>
                                        <span className="text-sm"><span className="font-semibold">{item.count} calls</span><span className="text-gray-500 ml-2">({item.avgTime}hr avg)</span></span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(item.count / data.totalCalls) * 100}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Calls by Status</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {data.byStatus.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-1 rounded" onClick={() => router.push(`/reports/after-sales/service-calls/status?status=${item.status}`)}>
                                    <span className="font-medium">{item.status}</span>
                                    <div className="flex items-center gap-3">
                                        <div className="w-32 bg-gray-200 rounded-full h-2">
                                            <div className={`h-2 rounded-full ${item.status === 'Resolved' ? 'bg-green-600' : item.status === 'In Progress' ? 'bg-blue-600' : 'bg-gray-600'}`} style={{ width: `${(item.count / data.totalCalls) * 100}%` }} />
                                        </div>
                                        <span className="font-semibold w-12 text-right">{item.count}</span>
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
