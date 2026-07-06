'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Star, TrendingUp } from 'lucide-react';
import { ClickableKPICard } from '@/components/reports/ClickableKPICard';
import { ClickableTableRow } from '@/components/reports/ClickableTableRow';
import { fetchReportDataset } from '@/services/reports-management.service';

interface VendorPerformanceData {
    avgRating: number;
    onTimeDelivery: number;
    qualityPass: number;
    topVendors: { id: string; name: string; rating: number; delivery: number; quality: number }[];
}

const DEFAULT_DATA: VendorPerformanceData = {
    avgRating: 4.2,
    onTimeDelivery: 88,
    qualityPass: 95,
    topVendors: [
        { id: 'VEN-001', name: 'Steel Suppliers Ltd', rating: 4.8, delivery: 95, quality: 98 },
        { id: 'VEN-002', name: 'Global Components', rating: 4.5, delivery: 92, quality: 96 },
        { id: 'VEN-003', name: 'Office Depot', rating: 4.2, delivery: 98, quality: 100 },
    ],
};

export default function VendorPerformanceReport() {
    const router = useRouter();
    const [data, setData] = useState<VendorPerformanceData>(DEFAULT_DATA);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const payload = await fetchReportDataset<Partial<VendorPerformanceData>>('procurement.vendor-performance');
                if (cancelled) return;
                if (payload) {
                    setData({
                        avgRating: Number(payload.avgRating ?? DEFAULT_DATA.avgRating),
                        onTimeDelivery: Number(payload.onTimeDelivery ?? DEFAULT_DATA.onTimeDelivery),
                        qualityPass: Number(payload.qualityPass ?? DEFAULT_DATA.qualityPass),
                        topVendors: Array.isArray(payload.topVendors) ? payload.topVendors : DEFAULT_DATA.topVendors,
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
                    <h1 className="text-3xl font-bold mb-2">Vendor Performance</h1>
                    <p className="text-gray-600">Rating and delivery analysis - Click cards to drill down</p>
                </div>
                <Button variant="outline"><Download className="mr-2 h-4 w-4" />Export</Button>
            </div>

            {isLoading && <p className="text-xs text-gray-400 mb-2">Loading latest figures…</p>}
            {loadError && <p className="text-xs text-amber-600 mb-2">Showing sample data — {loadError}</p>}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <ClickableKPICard
                    title="Avg Vendor Rating"
                    value={data.avgRating.toString()}
                    color="blue"
                    description="Out of 5.0"
                />
                <ClickableKPICard
                    title="On-Time Delivery"
                    value={`${data.onTimeDelivery}%`}
                    color={data.onTimeDelivery >= 90 ? 'green' : 'orange'}
                />
                <ClickableKPICard
                    title="Quality Pass Rate"
                    value={`${data.qualityPass}%`}
                    color="green"
                />
            </div>

            <Card>
                <CardHeader><CardTitle>Top Performing Vendors</CardTitle></CardHeader>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Vendor</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Rating</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Delivery %</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Quality %</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {data.topVendors.map((vendor) => (
                                <ClickableTableRow
                                    key={vendor.id}
                                    onClick={() => router.push(`/reports/procurement/vendor-performance/vendor/orders?id=${vendor.id}`)}
                                >
                                    <td className="px-4 py-3 text-sm font-medium text-blue-600">{vendor.name}</td>
                                    <td className="px-4 py-3 text-center text-sm font-bold flex items-center justify-center gap-1">
                                        {vendor.rating} <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                    </td>
                                    <td className="px-4 py-3 text-center text-sm">{vendor.delivery}%</td>
                                    <td className="px-4 py-3 text-center text-sm">{vendor.quality}%</td>
                                </ClickableTableRow>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}
