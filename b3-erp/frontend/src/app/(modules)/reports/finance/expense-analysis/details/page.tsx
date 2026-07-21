'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ReportDetailPage } from '@/components/reports/ReportDetailPage';
import { ClickableTableRow } from '@/components/reports/ClickableTableRow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchDomainList } from '@/services/reports-data.service';
import { exportToCsv } from '@/lib/export';

function ExpenseDetailsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const category = searchParams.get('category') || 'Unknown Category';

    const [expenses, setExpenses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const raw = await fetchDomainList<any>('finance/invoices?invoiceType=Purchase Invoice');
                const mapped = (Array.isArray(raw) ? raw : []).map((r: any) => ({
                    id: r.invoiceNumber ?? r.id ?? '',
                    date: r.invoiceDate ? String(r.invoiceDate).slice(0, 10) : '',
                    vendor: r.partyName ?? '',
                    description: r.referenceNumber ?? r.notes ?? r.invoiceType ?? '',
                    amount: Number(r.totalAmount ?? 0),
                    status: r.status ?? '',
                }));
                if (!cancelled) setExpenses(mapped);
            } catch (e) {
                if (!cancelled) { setLoadError(e instanceof Error ? e.message : 'Failed to load'); setExpenses([]); }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    return (
        <ReportDetailPage
            title={`Expense Details: ${category}`}
            description={`Expense transactions for ${category}`}
            breadcrumbs={[
                { label: 'Reports', href: '/reports' },
                { label: 'Finance', href: '/reports' },
                { label: 'Expense Analysis', href: '/reports/finance/expense-analysis' },
                { label: 'Details' }
            ]}
            onBack={() => router.back()}
            onExport={() => exportToCsv(`expense-details-${category}`, expenses)}
        >
            {isLoading && <div className="mb-3 rounded border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">Loading…</div>}
            {loadError && !isLoading && <div className="mb-3 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{loadError}</div>}
            <Card>
                <CardHeader>
                    <CardTitle>Expense Transactions</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ref ID</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor/Payee</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {expenses.map((exp) => (
                                <ClickableTableRow
                                    key={exp.id}
                                    onClick={() => router.push(`/procurement/bills/${exp.id}`)}
                                >
                                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-blue-600">{exp.id}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{exp.date}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{exp.vendor}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{exp.description}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-900">
                                        ₹{exp.amount.toLocaleString()}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-center text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${exp.status === 'Paid' || exp.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                                exp.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                            }`}>
                                            {exp.status}
                                        </span>
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

export default function ExpenseDetailsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ExpenseDetailsContent />
        </Suspense>
    );
}
