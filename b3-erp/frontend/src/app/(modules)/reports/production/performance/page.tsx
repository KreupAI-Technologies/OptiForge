'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Activity, Zap, BarChart3 } from 'lucide-react';
import { ClickableKPICard } from '@/components/reports/ClickableKPICard';
import { ClickableTableRow } from '@/components/reports/ClickableTableRow';
import { fetchReportDataset } from '@/services/reports-management.service';

interface ProductionPerformanceData {
    oee: number;
    availability: number;
    performance: number;
    quality: number;
    topWorkCenters: { id: string; name: string; oee: number }[];
}

const DEFAULT_DATA: ProductionPerformanceData = {
    oee: 84.5,
    availability: 92.0,
    performance: 88.5,
    quality: 96.0,
    topWorkCenters: [
        { id: 'WC-001', name: 'CNC Machining', oee: 88 },
        { id: 'WC-002', name: 'Assembly Line 1', oee: 82 },
        { id: 'WC-003', name: 'Paint Shop', oee: 75 },
    ],
};

export default function ProductionPerformanceReport() {
    const router = useRouter();

    const [data, setData] = useState<ProductionPerformanceData>(DEFAULT_DATA);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const payload = await fetchReportDataset<Partial<ProductionPerformanceData>>('production.performance');
                if (cancelled) return;
                if (payload) {
                    setData({
                        oee: Number(payload.oee ?? DEFAULT_DATA.oee),
                        availability: Number(payload.availability ?? DEFAULT_DATA.availability),
                        performance: Number(payload.performance ?? DEFAULT_DATA.performance),
                        quality: Number(payload.quality ?? DEFAULT_DATA.quality),
                        topWorkCenters: Array.isArray(payload.topWorkCenters) ? payload.topWorkCenters : DEFAULT_DATA.topWorkCenters,
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
                    <h1 className="text-3xl font-bold mb-2">Production Performance</h1>
                    <p className="text-gray-600">OEE and efficiency metrics - Click cards to drill down</p>
                </div>
                <Button variant="outline"><Download className="mr-2 h-4 w-4" />Export</Button>
            </div>

            {isLoading && <p className="text-xs text-gray-400 mb-2">Loading latest figures…</p>}
            {loadError && <p className="text-xs text-amber-600 mb-2">Showing sample data — {loadError}</p>}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                <ClickableKPICard
                    title="Overall OEE"
                    value={`${data.oee}%`}
                    color={data.oee >= 85 ? 'green' : 'orange'}
                    description="Click for breakdown"
                    onClick={() => router.push('/reports/production/performance/workcenter')}
                />
                <ClickableKPICard
                    title="Availability"
                    value={`${data.availability}%`}
                    color="blue"
                />
                <ClickableKPICard
                    title="Performance"
                    value={`${data.performance}%`}
                    color="purple"
                />
                <ClickableKPICard
                    title="Quality"
                    value={`${data.quality}%`}
                    color="green"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/reports/production/performance/workcenter')}>
                    <CardHeader><CardTitle>Work Center Performance</CardTitle></CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center h-40 bg-blue-50 rounded-lg border border-dashed border-blue-200">
                            <div className="text-center">
                                <Activity className="w-8 h-8 text-blue-500 mb-2" />
                                <p className="text-blue-700 font-medium">View Work Center Metrics</p>
                                <p className="text-sm text-blue-600">Click to analyze utilization</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/reports/production/performance/product')}>
                    <CardHeader><CardTitle>Product Performance</CardTitle></CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center h-40 bg-purple-50 rounded-lg border border-dashed border-purple-200">
                            <div className="text-center">
                                <BarChart3 className="w-8 h-8 text-purple-500 mb-2" />
                                <p className="text-purple-700 font-medium">View Product Metrics</p>
                                <p className="text-sm text-purple-600">Click to analyze cycle times</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
