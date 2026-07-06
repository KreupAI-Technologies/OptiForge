'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, PieChart, TrendingUp } from 'lucide-react';
import { ClickableKPICard } from '@/components/reports/ClickableKPICard';
import { fetchReportDataset } from '@/services/reports-management.service';

interface InventoryValuationData {
    totalValue: number;
    rawMaterials: number;
    wip: number;
    finishedGoods: number;
}

const DEFAULT_DATA: InventoryValuationData = {
    totalValue: 8500000,
    rawMaterials: 2500000,
    wip: 1800000,
    finishedGoods: 3200000,
};

export default function InventoryValuationReport() {
    const router = useRouter();
    const [data, setData] = useState<InventoryValuationData>(DEFAULT_DATA);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const payload = await fetchReportDataset<Partial<InventoryValuationData>>('inventory.valuation');
                if (cancelled) return;
                if (payload) {
                    setData({
                        totalValue: Number(payload.totalValue ?? DEFAULT_DATA.totalValue),
                        rawMaterials: Number(payload.rawMaterials ?? DEFAULT_DATA.rawMaterials),
                        wip: Number(payload.wip ?? DEFAULT_DATA.wip),
                        finishedGoods: Number(payload.finishedGoods ?? DEFAULT_DATA.finishedGoods),
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
                    <h1 className="text-3xl font-bold mb-2">Inventory Valuation</h1>
                    <p className="text-gray-600">Asset value analysis by category</p>
                </div>
                <Button variant="outline"><Download className="mr-2 h-4 w-4" />Export</Button>
            </div>

            {isLoading && <p className="text-xs text-gray-400 mb-2">Loading latest figures…</p>}
            {loadError && <p className="text-xs text-amber-600 mb-2">Showing sample data — {loadError}</p>}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                <ClickableKPICard
                    title="Total Inventory Value"
                    value={`₹${(data.totalValue / 100000).toFixed(1)}L`}
                    color="blue"
                    onClick={() => router.push('/reports/inventory/valuation/category')}
                />
                <ClickableKPICard
                    title="Raw Materials"
                    value={`₹${(data.rawMaterials / 100000).toFixed(1)}L`}
                    color="green"
                    onClick={() => router.push('/reports/inventory/stock/category?id=CAT-RAW')}
                />
                <ClickableKPICard
                    title="Work in Progress"
                    value={`₹${(data.wip / 100000).toFixed(1)}L`}
                    color="orange"
                    onClick={() => router.push('/reports/inventory/stock/category?id=CAT-WIP')}
                />
                <ClickableKPICard
                    title="Finished Goods"
                    value={`₹${(data.finishedGoods / 100000).toFixed(1)}L`}
                    color="purple"
                    onClick={() => router.push('/reports/inventory/stock/category?id=CAT-FG')}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/reports/inventory/valuation/category')}>
                    <CardHeader><CardTitle>Valuation Breakdown</CardTitle></CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center h-40 bg-blue-50 rounded-lg border border-dashed border-blue-200">
                            <div className="text-center">
                                <PieChart className="w-8 h-8 text-blue-500 mb-2" />
                                <p className="text-blue-700 font-medium">View Valuation by Category</p>
                                <p className="text-sm text-blue-600">Click to analyze asset distribution</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/reports/inventory/movement/history')}>
                    <CardHeader><CardTitle>Value Movement</CardTitle></CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center h-40 bg-green-50 rounded-lg border border-dashed border-green-200">
                            <div className="text-center">
                                <TrendingUp className="w-8 h-8 text-green-500 mb-2" />
                                <p className="text-green-700 font-medium">View Movement History</p>
                                <p className="text-sm text-green-600">Click to track value changes</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
