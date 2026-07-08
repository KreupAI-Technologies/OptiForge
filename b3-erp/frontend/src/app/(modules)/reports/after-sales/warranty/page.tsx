'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Shield } from 'lucide-react';
import { ClickableKPICard } from '@/components/reports/ClickableKPICard';
import { ClickableTableRow } from '@/components/reports/ClickableTableRow';
import { fetchReportDataset } from '@/services/reports-management.service';

interface WarrantyData {
    totalClaims: number;
    approved: number;
    rejected: number;
    pending: number;
    claimValue: number;
    byProduct: { id: string; product: string; claims: number; approved: number; value: number }[];
}

const DEFAULT_DATA: WarrantyData = {
    totalClaims: 124,
    approved: 98,
    rejected: 12,
    pending: 14,
    claimValue: 285000,
    byProduct: [
        { id: 'PROD-001', product: 'Commercial Ovens', claims: 42, approved: 35, value: 125000 },
        { id: 'PROD-002', product: 'Refrigeration Units', claims: 38, approved: 30, value: 98000 },
        { id: 'PROD-003', product: 'Industrial Mixers', claims: 28, approved: 22, value: 45000 },
        { id: 'PROD-004', product: 'Steel Frames', claims: 16, approved: 11, value: 17000 },
    ],
};

export default function WarrantyClaimsReport() {
    const router = useRouter();
    const [data, setData] = useState<WarrantyData>(DEFAULT_DATA);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const payload = await fetchReportDataset<Partial<WarrantyData>>('after-sales.warranty');
                if (cancelled) return;
                if (payload) {
                    setData({
                        totalClaims: Number(payload.totalClaims ?? DEFAULT_DATA.totalClaims),
                        approved: Number(payload.approved ?? DEFAULT_DATA.approved),
                        rejected: Number(payload.rejected ?? DEFAULT_DATA.rejected),
                        pending: Number(payload.pending ?? DEFAULT_DATA.pending),
                        claimValue: Number(payload.claimValue ?? DEFAULT_DATA.claimValue),
                        byProduct: Array.isArray(payload.byProduct) ? payload.byProduct : DEFAULT_DATA.byProduct,
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
                    <h1 className="text-3xl font-bold mb-2">Warranty Claims Report</h1>
                    <p className="text-gray-600">Product warranty tracking</p>
                </div>
                <Button variant="outline"><Download className="mr-2 h-4 w-4" />Export</Button>
            </div>

            {isLoading && <p className="text-xs text-gray-400 mb-2">Loading latest figures…</p>}
            {loadError && <p className="text-xs text-amber-600 mb-2">Showing sample data — {loadError}</p>}

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-3">
                <ClickableKPICard
                    title="Total Claims"
                    value={data.totalClaims.toString()}
                    color="blue"
                    onClick={() => router.push('/reports/after-sales/warranty/product')}
                />
                <ClickableKPICard
                    title="Approved"
                    value={data.approved.toString()}
                    color="green"
                    onClick={() => router.push('/reports/after-sales/warranty/product?status=Approved')}
                />
                <ClickableKPICard
                    title="Rejected"
                    value={data.rejected.toString()}
                    color="red"
                    onClick={() => router.push('/reports/after-sales/warranty/product?status=Rejected')}
                />
                <ClickableKPICard
                    title="Pending"
                    value={data.pending.toString()}
                    color="orange"
                    onClick={() => router.push('/reports/after-sales/warranty/product?status=Pending')}
                />
                <ClickableKPICard
                    title="Claim Value"
                    value={`$${(data.claimValue / 1000).toFixed(0)}K`}
                    color="purple"
                />
            </div>

            <Card>
                <CardHeader><CardTitle>Claims by Product</CardTitle></CardHeader>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Product</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Total Claims</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Approved</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Claim Value</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {data.byProduct.map((prod) => (
                                <ClickableTableRow
                                    key={prod.id}
                                    onClick={() => router.push(`/after-sales-service/warranties`)}
                                >
                                    <td className="px-4 py-3 text-sm font-medium text-blue-600">{prod.product}</td>
                                    <td className="px-4 py-3 text-center"><Badge variant="outline">{prod.claims}</Badge></td>
                                    <td className="px-4 py-3 text-center text-green-600 font-semibold">{prod.approved}</td>
                                    <td className="px-4 py-3 text-sm text-right font-semibold">${(prod.value / 1000).toFixed(0)}K</td>
                                </ClickableTableRow>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}
