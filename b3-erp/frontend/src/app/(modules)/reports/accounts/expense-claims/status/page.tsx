'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ReportDetailPage } from '@/components/reports/ReportDetailPage';
import { ClickableTableRow } from '@/components/reports/ClickableTableRow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchDomainList } from '@/services/reports-data.service';

function ExpenseClaimsStatusContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const status = searchParams.get('status') || 'All';
    const category = searchParams.get('category');

    const [claims, setClaims] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const raw = await fetchDomainList<any>('api/accounts/expense-claims');
                const mapped = raw.map((r: any) => ({
                    id: r.claimNumber ?? r.id,
                    employee: r.employeeName ?? '',
                    dept: r.department ?? '',
                    category: r.category ?? r.expenseType ?? '',
                    amount: Number(r.totalAmount ?? r.amount ?? 0),
                    date: r.claimDate ?? r.date ?? '',
                    status: r.status ?? '',
                }));
                if (!cancelled) setClaims(mapped);
            } catch (e) {
                if (!cancelled) { setLoadError(e instanceof Error ? e.message : 'Failed to load'); setClaims([]); }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    let filteredClaims = claims;

    if (category) {
        filteredClaims = filteredClaims.filter(c => c.category === category);
    } else if (status !== 'All') {
        filteredClaims = filteredClaims.filter(c => c.status === status);
    }

    const title = category ? `Expense Claims: ${category}` : `Expense Claims: ${status}`;

    return (
        <ReportDetailPage
            title={title}
            description={`List of expense claims`}
            breadcrumbs={[
                { label: 'Reports', href: '/reports' },
                { label: 'Accounts', href: '/reports' },
                { label: 'Expense Claims', href: '/reports/accounts/expense-claims' },
                { label: 'Details' }
            ]}
        >
            {isLoading && <div className="mb-3 rounded border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">Loading…</div>}
            {loadError && !isLoading && <div className="mb-3 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{loadError}</div>}
            <Card>
                <CardHeader>
                    <CardTitle>Claims List</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredClaims.map((claim) => (
                                <ClickableTableRow
                                    key={claim.id}
                                    onClick={() => router.push(`/accounts/expenses/${claim.id}`)}
                                >
                                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-blue-600">{claim.id}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{claim.employee}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{claim.dept}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{claim.category}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                                        ${claim.amount.toLocaleString()}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-center">
                                        <Badge variant={
                                            claim.status === 'Paid' ? 'default' :
                                                claim.status === 'Approved' ? 'secondary' :
                                                    claim.status === 'Rejected' ? 'destructive' : 'outline'
                                        }>
                                            {claim.status}
                                        </Badge>
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{claim.date}</td>
                                </ClickableTableRow>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </ReportDetailPage>
    );
}

export default function ExpenseClaimsStatusPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ExpenseClaimsStatusContent />
        </Suspense>
    );
}
