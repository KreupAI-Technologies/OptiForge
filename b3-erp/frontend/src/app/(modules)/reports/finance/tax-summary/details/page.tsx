'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ReportDetailPage } from '@/components/reports/ReportDetailPage';
import { fetchDomainList } from '@/services/reports-data.service';
import { exportToCsv } from '@/lib/export';
import { ClickableTableRow } from '@/components/reports/ClickableTableRow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function TaxDetailsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const code = searchParams.get('code') || 'Unknown';

    const [transactions, setTransactions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true); setLoadError(null);
            try {
                const raw = await fetchDomainList<any>('finance/invoices');
                const mapped = raw.map((r: any) => ({ id: r.invoiceNumber ?? r.id, date: r.invoiceDate ?? '', party: r.partyName ?? '', taxable: Number(r.subtotal ?? 0), tax: Number(r.taxAmount ?? 0), type: r.invoiceType ?? '' }));
                if (!cancelled) setTransactions(mapped);
            } catch (e) {
                if (!cancelled) { setLoadError(e instanceof Error ? e.message : 'Failed to load'); setTransactions([]); }
            } finally { if (!cancelled) setIsLoading(false); }
        })();
        return () => { cancelled = true; };
    }, []);

    // Filter logic would go here based on code (Input vs Output)
    // For mock purposes, we'll just show a mix

    return (
        <ReportDetailPage
            title={`Tax Details: ${code}`}
            description={`Transaction history for tax code ${code}`}
            breadcrumbs={[
                { label: 'Reports', href: '/reports' },
                { label: 'Finance', href: '/reports' },
                { label: 'Tax Summary', href: '/reports/finance/tax-summary' },
                { label: 'Details' }
            ]}
            onBack={() => router.back()}
            onExport={() => exportToCsv(`tax-details-${code}`, transactions)}
        >
            {isLoading && <div className="mb-3 rounded border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">Loading…</div>}
            {loadError && !isLoading && <div className="mb-3 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{loadError}</div>}
            <Card>
                <CardHeader>
                    <CardTitle>Tax Transactions</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice/Bill #</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Party Name</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Taxable Amount</th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Tax Amount</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {transactions.map((txn) => (
                                <ClickableTableRow
                                    key={txn.id}
                                    onClick={() => router.push(`/finance/general-ledger`)}
                                >
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{txn.date}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-blue-600">{txn.id}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{txn.party}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{txn.type}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-900">
                                        ₹{txn.taxable.toLocaleString()}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                                        ₹{txn.tax.toLocaleString()}
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

export default function TaxDetailsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <TaxDetailsContent />
        </Suspense>
    );
}
