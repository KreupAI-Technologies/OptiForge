'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Package, AlertCircle } from 'lucide-react';
import { ClickableKPICard } from '@/components/reports/ClickableKPICard';
import { fetchReportDataset } from '@/services/reports-management.service';

interface MaterialConsumptionData {
    totalCost: number;
    variance: number;
    topMaterial: string;
    wastage: number;
}

const DEFAULT_DATA: MaterialConsumptionData = {
    totalCost: 450000,
    variance: 12000,
    topMaterial: 'Steel Sheet 2mm',
    wastage: 2.5,
};

export default function MaterialConsumptionReport() {
    const router = useRouter();

    const [data, setData] = useState<MaterialConsumptionData>(DEFAULT_DATA);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const payload = await fetchReportDataset<Partial<MaterialConsumptionData>>('production.material-consumption');
                if (cancelled) return;
                if (payload) {
                    setData({
                        totalCost: Number(payload.totalCost ?? DEFAULT_DATA.totalCost),
                        variance: Number(payload.variance ?? DEFAULT_DATA.variance),
                        topMaterial: String(payload.topMaterial ?? DEFAULT_DATA.topMaterial),
                        wastage: Number(payload.wastage ?? DEFAULT_DATA.wastage),
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
                    <h1 className="text-3xl font-bold mb-2">Material Consumption</h1>
                    <p className="text-gray-600">Track material usage and variance</p>
                </div>
                <Button variant="outline"><Download className="mr-2 h-4 w-4" />Export</Button>
            </div>

            {isLoading && <p className="text-xs text-gray-400 mb-2">Loading latest figures…</p>}
            {loadError && <p className="text-xs text-amber-600 mb-2">Showing sample data — {loadError}</p>}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                <ClickableKPICard
                    title="Total Material Cost"
                    value={`₹${(data.totalCost / 1000).toFixed(0)}K`}
                    color="blue"
                    onClick={() => router.push('/reports/production/material-consumption/wo')}
                />
                <ClickableKPICard
                    title="Cost Variance"
                    value={`₹${(data.variance / 1000).toFixed(1)}K`}
                    color="red"
                    description="Click for breakdown"
                    onClick={() => router.push('/reports/production/material-consumption/material')}
                />
                <ClickableKPICard
                    title="Top Material"
                    value="Steel Sheet"
                    color="purple"
                    onClick={() => router.push('/inventory/items/MAT-001')}
                />
                <ClickableKPICard
                    title="Wastage %"
                    value={`${data.wastage}%`}
                    color="orange"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/reports/production/material-consumption/material')}>
                    <CardHeader><CardTitle>Material Breakdown</CardTitle></CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center h-40 bg-blue-50 rounded-lg border border-dashed border-blue-200">
                            <div className="text-center">
                                <Package className="w-8 h-8 text-blue-500 mb-2" />
                                <p className="text-blue-700 font-medium">View Consumption by Material</p>
                                <p className="text-sm text-blue-600">Click to analyze usage</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/reports/production/material-consumption/wo')}>
                    <CardHeader><CardTitle>Work Order Analysis</CardTitle></CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center h-40 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                            <div className="text-center">
                                <AlertCircle className="w-8 h-8 text-gray-500 mb-2" />
                                <p className="text-gray-700 font-medium">View Cost by Work Order</p>
                                <p className="text-sm text-gray-600">Click to identify high variance</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
