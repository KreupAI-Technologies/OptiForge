'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ReportDetailPage } from '@/components/reports/ReportDetailPage';
import { ClickableTableRow } from '@/components/reports/ClickableTableRow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchDomainList } from '@/services/reports-data.service';

function WarrantyProductContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const status = searchParams.get('status') || 'All';

    const [claims, setClaims] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const raw = await fetchDomainList<any>('after-sales/warranties');
                const mapped = raw.map((r: any) => ({
                    id: r.warrantyNumber ?? r.claimNumber ?? r.id,
                    product: r.productName ?? r.itemName ?? '',
                    serial: r.serialNumber ?? '',
                    customer: r.customerName ?? '',
                    issue: r.issue ?? r.description ?? '',
                    value: Number(r.claimValue ?? r.value ?? 0),
                    status: r.status ?? '',
                }));
                if (!cancelled) setClaims(mapped);
            } catch (e) {
                if (!cancelled) {
                    setLoadError(e instanceof Error ? e.message : 'Failed to load');
                    setClaims([]);
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const filteredClaims = status === 'All'
        ? claims
        : claims.filter(c => c.status === status);

    return (
        <ReportDetailPage
            title={`Warranty Claims: ${status}`}
            description={`List of warranty claims with status: ${status}`}
            breadcrumbs={[
                { label: 'Reports', href: '/reports' },
                { label: 'After-Sales', href: '/reports' },
                { label: 'Warranty Claims', href: '/reports/after-sales/warranty' },
                { label: status }
            ]}
        >
            <>
            {isLoading && <div className="mb-3 rounded border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">Loading…</div>}
            {loadError && !isLoading && <div className="mb-3 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{loadError}</div>}
            <Card>
                <CardHeader>
                    <CardTitle>Claim List</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Claim ID</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue</th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredClaims.map((claim) => (
                                <ClickableTableRow
                                    key={claim.id}
                                    onClick={() => router.push(`/after-sales/warranty-claims/${claim.id}`)}
                                >
                                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-blue-600">{claim.id}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                        <div>{claim.product}</div>
                                        <div className="text-xs text-gray-500">{claim.serial}</div>
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{claim.customer}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{claim.issue}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-right font-medium">${claim.value.toLocaleString()}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                                        <Badge variant={claim.status === 'Rejected' ? 'destructive' : claim.status === 'Approved' ? 'default' : 'secondary'}>
                                            {claim.status}
                                        </Badge>
                                    </td>
                                </ClickableTableRow>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
            </>
        </ReportDetailPage>
    );
}

export default function WarrantyProductPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <WarrantyProductContent />
        </Suspense>
    );
}
