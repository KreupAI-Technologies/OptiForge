'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, MapPin, Package, AlertTriangle } from 'lucide-react';
import { ClickableKPICard } from '@/components/reports/ClickableKPICard';
import { fetchReportDataset } from '@/services/reports-management.service';

interface StockAvailabilityData {
    totalItems: number;
    lowStock: number;
    outOfStock: number;
    totalValue: number;
}

const DEFAULT_DATA: StockAvailabilityData = {
    totalItems: 1250,
    lowStock: 45,
    outOfStock: 12,
    totalValue: 8500000,
};

export default function StockAvailabilityReport() {
    const router = useRouter();
    const [data, setData] = useState<StockAvailabilityData>(DEFAULT_DATA);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const payload = await fetchReportDataset<Partial<StockAvailabilityData>>('inventory.stock');
                if (cancelled) return;
                if (payload) {
                    setData({
                        totalItems: Number(payload.totalItems ?? DEFAULT_DATA.totalItems),
                        lowStock: Number(payload.lowStock ?? DEFAULT_DATA.lowStock),
                        outOfStock: Number(payload.outOfStock ?? DEFAULT_DATA.outOfStock),
                        totalValue: Number(payload.totalValue ?? DEFAULT_DATA.totalValue),
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
                    <h1 className="text-3xl font-bold mb-2">Stock Availability</h1>
                    <p className="text-gray-600">Track stock levels and shortages</p>
                </div>
                <Button variant="outline"><Download className="mr-2 h-4 w-4" />Export</Button>
            </div>

            {isLoading && <p className="text-xs text-gray-400 mb-2">Loading latest figures…</p>}
            {loadError && <p className="text-xs text-amber-600 mb-2">Showing sample data — {loadError}</p>}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                <ClickableKPICard
                    title="Total Items"
                    value={data.totalItems.toString()}
                    color="blue"
                    onClick={() => router.push('/reports/inventory/stock/category')}
                />
                <ClickableKPICard
                    title="Low Stock"
                    value={data.lowStock.toString()}
                    color="orange"
                    description="Below reorder level"
                    onClick={() => router.push('/reports/inventory/stock/category?status=Low')}
                />
                <ClickableKPICard
                    title="Out of Stock"
                    value={data.outOfStock.toString()}
                    color="red"
                    description="Critical shortages"
                    onClick={() => router.push('/reports/inventory/stock/category?status=Critical')}
                />
                <ClickableKPICard
                    title="Total Value"
                    value={`₹${(data.totalValue / 100000).toFixed(1)}L`}
                    color="green"
                    onClick={() => router.push('/reports/inventory/valuation')}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/reports/inventory/stock/location')}>
                    <CardHeader><CardTitle>Warehouse Distribution</CardTitle></CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center h-40 bg-blue-50 rounded-lg border border-dashed border-blue-200">
                            <div className="text-center">
                                <MapPin className="w-8 h-8 text-blue-500 mb-2" />
                                <p className="text-blue-700 font-medium">View Stock by Location</p>
                                <p className="text-sm text-blue-600">Click to analyze warehouses</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/reports/inventory/stock/category')}>
                    <CardHeader><CardTitle>Category Analysis</CardTitle></CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center h-40 bg-purple-50 rounded-lg border border-dashed border-purple-200">
                            <div className="text-center">
                                <Package className="w-8 h-8 text-purple-500 mb-2" />
                                <p className="text-purple-700 font-medium">View Stock by Category</p>
                                <p className="text-sm text-purple-600">Click to see item breakdown</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
