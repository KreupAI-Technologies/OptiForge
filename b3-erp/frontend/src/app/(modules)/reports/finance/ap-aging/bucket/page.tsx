'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ReportDetailPage } from '@/components/reports/ReportDetailPage';
import { ClickableTableRow } from '@/components/reports/ClickableTableRow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchReportRows } from '@/services/reports-management.service';

interface BillRow {
    id: string;
    vendor: string;
    date: string;
    dueDate: string;
    amount: number;
    status: string;
}

function AgingBucketContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const bucket = searchParams.get('bucket') || 'All';

    const [bills, setBills] = useState<BillRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const rows = await fetchReportRows<Partial<BillRow>>('finance.ap-aging.bucket');
                const mapped: BillRow[] = (Array.isArray(rows) ? rows : []).map((r) => ({
                    id: String(r.id ?? ''),
                    vendor: String(r.vendor ?? ''),
                    date: String(r.date ?? ''),
                    dueDate: String(r.dueDate ?? ''),
                    amount: Number(r.amount ?? 0),
                    status: String(r.status ?? ''),
                }));
                if (!cancelled) setBills(mapped);
            } catch (err) {
                if (!cancelled) {
                    setLoadError(err instanceof Error ? err.message : 'Failed to load bills');
                    setBills([]);
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, []);

    return (
        <ReportDetailPage
            title={`Aging Bucket: ${bucket}`}
            description={`Bills falling into the ${bucket} aging category`}
            breadcrumbs={[
                { label: 'Reports', href: '/reports' },
                { label: 'Finance', href: '/reports' },
                { label: 'AP Aging', href: '/reports/finance/ap-aging' },
                { label: bucket }
            ]}
        >
            <Card>
                <CardHeader>
                    <CardTitle>Bills in {bucket}</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bill #</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bill Date</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading && (
                                <tr><td colSpan={6} className="px-3 py-6 text-center text-sm text-gray-500">Loading bills…</td></tr>
                            )}
                            {!isLoading && loadError && (
                                <tr><td colSpan={6} className="px-3 py-6 text-center text-sm text-red-600">{loadError}</td></tr>
                            )}
                            {!isLoading && !loadError && bills.length === 0 && (
                                <tr><td colSpan={6} className="px-3 py-6 text-center text-sm text-gray-500">No bills found.</td></tr>
                            )}
                            {!isLoading && !loadError && bills.map((bill) => (
                                <ClickableTableRow
                                    key={bill.id}
                                    onClick={() => router.push(`/procurement/bills/${bill.id}`)}
                                >
                                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-blue-600">{bill.id}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{bill.vendor}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{bill.date}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{bill.dueDate}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${bill.status === 'Overdue' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                            }`}>
                                            {bill.status}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-right font-medium">
                                        ₹{bill.amount.toLocaleString()}
                                    </td>
                                </ClickableTableRow>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </ReportDetailPage>
    );
}

export default function AgingBucketPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AgingBucketContent />
        </Suspense>
    );
}
