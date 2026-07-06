'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Package, AlertTriangle } from 'lucide-react';
import { fetchReportDataset } from '@/services/reports-management.service';

interface StockAgingData {
    totalValue: number;
    slowMoving: number;
    obsolete: number;
    agingBuckets: { bucket: string; value: number; count: number }[];
    slowMovingItems: { item: string; qty: number; value: number; age: number; id: string }[];
}

const DEFAULT_DATA: StockAgingData = {
    totalValue: 5680000,
    slowMoving: 1250000,
    obsolete: 285000,
    agingBuckets: [
        { bucket: '0-30 days', value: 2850000, count: 520 },
        { bucket: '31-90 days', value: 1295000, count: 285 },
        { bucket: '91-180 days', value: 850000, count: 198 },
        { bucket: '181-365 days', value: 450000, count: 125 },
        { bucket: '365+ days (Obsolete)', value: 235000, count: 119 },
    ],
    slowMovingItems: [
        { item: 'Brake Pads Model X', qty: 450, value: 22500, age: 245, id: 'ITEM-006' },
        { item: 'Filter Cartridges', qty: 350, value: 17500, age: 198, id: 'ITEM-007' },
        { item: 'Bearing Sets Obsolete', qty: 125, value: 12500, age: 420, id: 'ITEM-008' },
        { item: 'Legacy Components', qty: 85, value: 8500, age: 385, id: 'ITEM-009' },
    ],
};

export default function StockAgingReport() {
    const router = useRouter();
    const [data, setData] = useState<StockAgingData>(DEFAULT_DATA);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const payload = await fetchReportDataset<Partial<StockAgingData>>('inventory.aging');
                if (cancelled) return;
                if (payload) {
                    setData({
                        totalValue: Number(payload.totalValue ?? DEFAULT_DATA.totalValue),
                        slowMoving: Number(payload.slowMoving ?? DEFAULT_DATA.slowMoving),
                        obsolete: Number(payload.obsolete ?? DEFAULT_DATA.obsolete),
                        agingBuckets: Array.isArray(payload.agingBuckets) ? payload.agingBuckets : DEFAULT_DATA.agingBuckets,
                        slowMovingItems: Array.isArray(payload.slowMovingItems) ? payload.slowMovingItems : DEFAULT_DATA.slowMovingItems,
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
                    <h1 className="text-3xl font-bold mb-2">Stock Aging Report</h1>
                    <p className="text-gray-600">Slow-moving and obsolete inventory analysis</p>
                </div>
                <Button variant="outline"><Download className="mr-2 h-4 w-4" />Export</Button>
            </div>

            {isLoading && <p className="text-xs text-gray-400 mb-2">Loading latest figures…</p>}
            {loadError && <p className="text-xs text-amber-600 mb-2">Showing sample data — {loadError}</p>}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                <Card><CardContent className="pt-6"><p className="text-sm text-gray-600">Total Stock Value</p><p className="text-2xl font-bold text-blue-600">${(data.totalValue / 1000000).toFixed(2)}M</p></CardContent></Card>
                <Card><CardContent className="pt-6"><p className="text-sm text-gray-600">Slow-Moving</p><p className="text-2xl font-bold text-orange-600">${(data.slowMoving / 1000).toFixed(0)}K</p><p className="text-xs text-gray-500 mt-1">{((data.slowMoving / data.totalValue) * 100).toFixed(0)}% of total</p></CardContent></Card>
                <Card><CardContent className="pt-6"><p className="text-sm text-gray-600">Obsolete</p><p className="text-2xl font-bold text-red-600">${(data.obsolete / 1000).toFixed(0)}K</p><p className="text-xs text-gray-500 mt-1">{((data.obsolete / data.totalValue) * 100).toFixed(0)}% of total</p></CardContent></Card>
                <Card><CardContent className="pt-6"><p className="text-sm text-gray-600">Risk Level</p><p className="text-2xl font-bold text-orange-600">Medium</p></CardContent></Card>
            </div>

            <Card className="mb-3">
                <CardHeader><CardTitle>Inventory Aging Analysis - Click buckets to drill down</CardTitle></CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {data.agingBuckets.map((bucket, idx) => (
                            <div
                                key={idx}
                                className="cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                                onClick={() => router.push(`/reports/inventory/aging/bucket?bucket=${encodeURIComponent(bucket.bucket)}`)}
                            >
                                <div className="flex justify-between mb-2">
                                    <span className="font-medium">{bucket.bucket}</span>
                                    <span className="text-sm"><span className="font-semibold">${(bucket.value / 1000).toFixed(0)}K</span><span className="text-gray-500 ml-2">({bucket.count} items)</span></span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div className={`h-3 rounded-full ${idx === 0 ? 'bg-green-600' : idx === 1 ? 'bg-blue-600' : idx === 2 ? 'bg-orange-600' : idx === 3 ? 'bg-red-500' : 'bg-red-700'}`} style={{ width: `${(bucket.value / data.totalValue) * 100}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Slow-Moving / Obsolete Items</CardTitle></CardHeader>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Item</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Quantity</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Value</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Age (Days)</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {data.slowMovingItems.map((item, idx) => (
                                <tr
                                    key={idx}
                                    className="hover:bg-gray-50 cursor-pointer"
                                    onClick={() => router.push(`/inventory/items/${item.id}`)}
                                >
                                    <td className="px-4 py-3 text-sm font-medium text-blue-600">{item.item}</td>
                                    <td className="px-4 py-3 text-sm text-right">{item.qty}</td>
                                    <td className="px-4 py-3 text-sm text-right font-semibold">${item.value.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-center text-sm font-semibold">{item.age}</td>
                                    <td className="px-4 py-3 text-center">
                                        <Badge className={item.age > 365 ? 'bg-red-600' : item.age > 180 ? 'bg-orange-600' : 'bg-yellow-600'}>
                                            {item.age > 365 ? 'Obsolete' : item.age > 180 ? 'Slow-Moving' : 'At Risk'}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}
