'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ReportDetailPage } from '@/components/reports/ReportDetailPage';
import { fetchDomainList } from '@/services/reports-data.service';
import { exportToCsv } from '@/lib/export';
import { ClickableTableRow } from '@/components/reports/ClickableTableRow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function CostCenterDetailsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const name = searchParams.get('name') || 'Unknown Cost Center';

    const [expenses, setExpenses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true); setLoadError(null);
            try {
                const raw = await fetchDomainList<any>('finance/cost-centers');
                const mapped = raw.map((r: any) => ({ id: r.costCenterCode ?? r.id, date: r.createdAt ?? '', category: r.department ?? '', description: r.description ?? '', amount: Number(r.actualAmount ?? 0) }));
                if (!cancelled) setExpenses(mapped);
            } catch (e) {
                if (!cancelled) { setLoadError(e instanceof Error ? e.message : 'Failed to load'); setExpenses([]); }
            } finally { if (!cancelled) setIsLoading(false); }
        })();
        return () => { cancelled = true; };
    }, []);

    const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);

    return (
        <ReportDetailPage
            title={`Cost Center: ${name}`}
            description={`Expense breakdown for ${name}`}
            breadcrumbs={[
                { label: 'Reports', href: '/reports' },
                { label: 'Finance', href: '/reports' },
                { label: 'Cost Center Analysis', href: '/reports/finance/cost-center' },
                { label: 'Details' }
            ]}
            onBack={() => router.back()}
            onExport={() => exportToCsv(`cost-center-${name}`, expenses)}
        >
            {isLoading && <div className="mb-3 rounded border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">Loading…</div>}
            {loadError && !isLoading && <div className="mb-3 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{loadError}</div>}
            <Card>
                <CardHeader>
                    <CardTitle>Expense Allocation</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ref ID</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {expenses.map((exp) => (
                                <ClickableTableRow
                                    key={exp.id}
                                    onClick={() => router.push(`/finance/expense-claims`)}
                                >
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{exp.date}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-blue-600">{exp.id}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{exp.category}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{exp.description}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-900">
                                        ₹{exp.amount.toLocaleString()}
                                    </td>
                                </ClickableTableRow>
                            ))}
                            <tr className="bg-gray-50 font-bold">
                                <td className="px-3 py-2" colSpan={4}>Total Expenses</td>
                                <td className="px-3 py-2 text-right text-blue-600">₹{totalExpenses.toLocaleString()}</td>
                            </tr>
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </ReportDetailPage>
    );
}

export default function CostCenterDetailsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CostCenterDetailsContent />
        </Suspense>
    );
}
