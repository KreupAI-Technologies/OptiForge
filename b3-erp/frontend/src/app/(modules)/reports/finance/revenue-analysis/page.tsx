'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { ClickableTableRow } from '@/components/reports/ClickableTableRow';
import { fetchDomainList } from '@/services/reports-data.service';
import { exportToCsv } from '@/lib/export';

export default function RevenueAnalysisReport() {
    const router = useRouter();
    const [revenueStreams, setRevenueStreams] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                // Revenue analysis derives from posted sales invoices, grouped by customer.
                const raw = await fetchDomainList<any>('finance/invoices?invoiceType=Sales Invoice');
                const groups = new Map<string, number>();
                (Array.isArray(raw) ? raw : []).forEach((r: any) => {
                    const key = r.partyName ?? 'Unknown';
                    groups.set(key, (groups.get(key) ?? 0) + Number(r.totalAmount ?? 0));
                });
                const mapped = Array.from(groups.entries())
                    .sort((a, b) => b[1] - a[1])
                    .map(([product, revenue], i) => ({
                        id: `REV-${String(i + 1).padStart(3, '0')}`,
                        product,
                        category: 'Sales',
                        revenue,
                        growth: 0,
                    }));
                if (!cancelled) setRevenueStreams(mapped);
            } catch (e) {
                if (!cancelled) { setLoadError(e instanceof Error ? e.message : 'Failed to load'); setRevenueStreams([]); }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    return (
        <div className="w-full p-3">
            {isLoading && <div className="mb-3 rounded border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">Loading…</div>}
            {loadError && !isLoading && <div className="mb-3 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{loadError}</div>}
            <div className="flex justify-between items-center mb-3">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Revenue Analysis</h1>
                    <p className="text-gray-600">Detailed breakdown of revenue by product/service</p>
                </div>
                <Button variant="outline" onClick={() => exportToCsv('revenue-analysis', revenueStreams)} disabled={revenueStreams.length === 0}><Download className="mr-2 h-4 w-4" />Export</Button>
            </div>

            <Card>
                <CardHeader><CardTitle>Revenue by Product Line</CardTitle></CardHeader>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Product/Service</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Category</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Revenue</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">YoY Growth</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {revenueStreams.map((item) => (
                                <ClickableTableRow
                                    key={item.id}
                                    onClick={() => router.push(`/reports/finance/revenue-analysis/details?product=${encodeURIComponent(item.product)}`)}
                                >
                                    <td className="px-4 py-3 text-sm font-medium text-blue-600">{item.product}</td>
                                    <td className="px-4 py-3 text-sm text-gray-500">{item.category}</td>
                                    <td className="px-4 py-3 text-sm text-right text-gray-900">₹{item.revenue.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-sm text-right text-green-600">+{item.growth}%</td>
                                </ClickableTableRow>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}
