'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, AlertTriangle, DollarSign, Calendar } from 'lucide-react';
import { ClickableKPICard } from '@/components/reports/ClickableKPICard';
import { ClickableTableRow } from '@/components/reports/ClickableTableRow';
import { fetchReportDataset } from '@/services/reports-management.service';

interface APAgingData {
    totalAP: number;
    overdueAmount: number;
    agingBuckets: { bucket: string; amount: number; count: number }[];
    topVendors: { vendor: string; current: number; overdue: number; total: number; id: string }[];
}

const DEFAULT_DATA: APAgingData = {
    totalAP: 1800000,
    overdueAmount: 320000,
    agingBuckets: [
        { bucket: 'Current (0-30 days)', amount: 950000, count: 45 },
        { bucket: '31-60 days', amount: 350000, count: 12 },
        { bucket: '61-90 days', amount: 180000, count: 8 },
        { bucket: '90+ days (Overdue)', amount: 320000, count: 5 },
    ],
    topVendors: [
        { vendor: 'Steel Suppliers Ltd', current: 450000, overdue: 0, total: 450000, id: 'VEN-001' },
        { vendor: 'Logistics Partners', current: 120000, overdue: 45000, total: 165000, id: 'VEN-002' },
        { vendor: 'Office Depot', current: 25000, overdue: 12000, total: 37000, id: 'VEN-003' },
    ],
};

export default function APAgingReport() {
    const router = useRouter();
    const [data, setData] = useState<APAgingData>(DEFAULT_DATA);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const payload = await fetchReportDataset<Partial<APAgingData>>('finance.ap-aging');
                if (cancelled) return;
                if (payload) {
                    setData({
                        totalAP: Number(payload.totalAP ?? DEFAULT_DATA.totalAP),
                        overdueAmount: Number(payload.overdueAmount ?? DEFAULT_DATA.overdueAmount),
                        agingBuckets: Array.isArray(payload.agingBuckets) ? payload.agingBuckets : DEFAULT_DATA.agingBuckets,
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
                    <h1 className="text-3xl font-bold mb-2">Accounts Payable Aging</h1>
                    <p className="text-gray-600">Track vendor payments and overdue bills</p>
                </div>
                <Button variant="outline"><Download className="mr-2 h-4 w-4" />Export</Button>
            </div>

            {isLoading && <p className="text-xs text-gray-400 mb-2">Loading latest figures…</p>}
            {loadError && <p className="text-xs text-amber-600 mb-2">Showing sample data — {loadError}</p>}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <ClickableKPICard
                    title="Total Payables"
                    value={`₹${(data.totalAP / 100000).toFixed(1)}L`}
                    color="blue"
                />
                <ClickableKPICard
                    title="Overdue Amount"
                    value={`₹${(data.overdueAmount / 100000).toFixed(1)}L`}
                    color="red"
                    description={`${((data.overdueAmount / data.totalAP) * 100).toFixed(0)}% of total`}
                />
                <ClickableKPICard
                    title="Vendors with Balance"
                    value="12"
                    color="orange"
                />
            </div>

            <Card className="mb-3">
                <CardHeader><CardTitle>Aging Analysis - Click buckets to drill down</CardTitle></CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {data.agingBuckets.map((bucket, idx) => (
                            <div
                                key={idx}
                                className="cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                                onClick={() => router.push(`/reports/finance/ap-aging/bucket?bucket=${encodeURIComponent(bucket.bucket)}`)}
                            >
                                <div className="flex justify-between mb-2">
                                    <span className="font-medium">{bucket.bucket}</span>
                                    <span className="text-sm">
                                        <span className="font-semibold">₹{(bucket.amount / 1000).toFixed(0)}K</span>
                                        <span className="text-gray-500 ml-2">({bucket.count} bills)</span>
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className={`h-3 rounded-full ${idx === 0 ? 'bg-green-600' : idx === 1 ? 'bg-blue-600' : idx === 2 ? 'bg-orange-600' : 'bg-red-600'}`}
                                        style={{ width: `${(bucket.amount / data.totalAP) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Top Vendors by Balance</CardTitle></CardHeader>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Vendor</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Current</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Overdue</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Total Balance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {data.topVendors.map((vendor, idx) => (
                                <ClickableTableRow
                                    key={idx}
                                    onClick={() => router.push(`/reports/procurement/vendor-performance/vendor?id=${vendor.id}`)}
                                >
                                    <td className="px-4 py-3 text-sm font-medium">{vendor.vendor}</td>
                                    <td className="px-4 py-3 text-sm text-right text-green-600">₹{vendor.current.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-sm text-right text-red-600">₹{vendor.overdue.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-sm text-right font-bold">₹{vendor.total.toLocaleString()}</td>
                                </ClickableTableRow>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}
