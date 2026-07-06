'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Factory, AlertTriangle, CheckCircle } from 'lucide-react';
import { ClickableKPICard } from '@/components/reports/ClickableKPICard';
import { fetchReportDataset } from '@/services/reports-management.service';

interface WorkOrderData {
    totalActive: number;
    inProgress: number;
    delayed: number;
    completedToday: number;
}

const DEFAULT_DATA: WorkOrderData = {
    totalActive: 45,
    inProgress: 28,
    delayed: 5,
    completedToday: 12,
};

export default function WorkOrderReport() {
    const router = useRouter();

    const [data, setData] = useState<WorkOrderData>(DEFAULT_DATA);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const payload = await fetchReportDataset<Partial<WorkOrderData>>('production.work-orders');
                if (cancelled) return;
                if (payload) {
                    setData({
                        totalActive: Number(payload.totalActive ?? DEFAULT_DATA.totalActive),
                        inProgress: Number(payload.inProgress ?? DEFAULT_DATA.inProgress),
                        delayed: Number(payload.delayed ?? DEFAULT_DATA.delayed),
                        completedToday: Number(payload.completedToday ?? DEFAULT_DATA.completedToday),
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
                    <h1 className="text-3xl font-bold mb-2">Work Orders</h1>
                    <p className="text-gray-600">Track production status and delays</p>
                </div>
                <Button variant="outline"><Download className="mr-2 h-4 w-4" />Export</Button>
            </div>

            {isLoading && <p className="text-xs text-gray-400 mb-2">Loading latest figures…</p>}
            {loadError && <p className="text-xs text-amber-600 mb-2">Showing sample data — {loadError}</p>}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                <ClickableKPICard
                    title="Total Active"
                    value={data.totalActive.toString()}
                    color="blue"
                    onClick={() => router.push('/reports/production/work-orders/status?status=All')}
                />
                <ClickableKPICard
                    title="In Progress"
                    value={data.inProgress.toString()}
                    color="orange"
                    onClick={() => router.push('/reports/production/work-orders/status?status=In Progress')}
                />
                <ClickableKPICard
                    title="Delayed"
                    value={data.delayed.toString()}
                    color="red"
                    onClick={() => router.push('/reports/production/work-orders/status?status=Delayed')}
                />
                <ClickableKPICard
                    title="Completed Today"
                    value={data.completedToday.toString()}
                    color="green"
                    onClick={() => router.push('/reports/production/work-orders/status?status=Completed')}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/reports/production/work-orders/status?status=Delayed')}>
                    <CardHeader><CardTitle>Delay Analysis</CardTitle></CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center h-40 bg-red-50 rounded-lg border border-dashed border-red-200">
                            <div className="text-center">
                                <AlertTriangle className="w-8 h-8 text-red-500 mb-2" />
                                <p className="text-red-700 font-medium">5 Delayed Orders</p>
                                <p className="text-sm text-red-600">Click to view reasons</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/reports/production/work-orders/status?status=In Progress')}>
                    <CardHeader><CardTitle>Shop Floor Status</CardTitle></CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center h-40 bg-orange-50 rounded-lg border border-dashed border-orange-200">
                            <div className="text-center">
                                <Factory className="w-8 h-8 text-orange-500 mb-2" />
                                <p className="text-orange-700 font-medium">28 Jobs Running</p>
                                <p className="text-sm text-orange-600">Click to view details</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
