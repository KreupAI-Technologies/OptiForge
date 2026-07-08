'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Users, DollarSign, Clock } from 'lucide-react';
import { ClickableKPICard } from '@/components/reports/ClickableKPICard';
import { ClickableTableRow } from '@/components/reports/ClickableTableRow';
import { fetchReportDataset } from '@/services/reports-management.service';

interface ExpenseClaimsData {
    totalClaims: number;
    totalAmount: number;
    pendingClaims: number;
    avgProcessingTime: number;
    byStatus: { status: string; count: number; amount: number }[];
    byCategory: { id: string; category: string; amount: number; count: number }[];
    topClaimants: { id: string; name: string; dept: string; claims: number; amount: number }[];
}

const DEFAULT_DATA: ExpenseClaimsData = {
    totalClaims: 124,
    totalAmount: 284500,
    pendingClaims: 18,
    avgProcessingTime: 3.5,
    byStatus: [
        { status: 'Submitted', count: 18, amount: 45000 },
        { status: 'Approved', count: 12, amount: 32000 },
        { status: 'Paid', count: 86, amount: 198500 },
        { status: 'Rejected', count: 8, amount: 9000 },
    ],
    byCategory: [
        { id: 'CAT-001', category: 'Travel', amount: 125000, count: 45 },
        { id: 'CAT-002', category: 'Meals', amount: 58000, count: 38 },
        { id: 'CAT-003', category: 'Accommodation', amount: 72000, count: 24 },
        { id: 'CAT-004', category: 'Office Supplies', amount: 18500, count: 12 },
        { id: 'CAT-005', category: 'Other', amount: 11000, count: 5 },
    ],
    topClaimants: [
        { id: 'EMP-001', name: 'John Doe', dept: 'Sales', claims: 12, amount: 28500 },
        { id: 'EMP-002', name: 'Jane Smith', dept: 'Sales', claims: 10, amount: 24000 },
        { id: 'EMP-003', name: 'Mike Johnson', dept: 'Engineering', claims: 8, amount: 18500 },
    ],
};

export default function ExpenseClaimsReport() {
    const router = useRouter();
    const [period, setPeriod] = useState('this-month');

    const [data, setData] = useState<ExpenseClaimsData>(DEFAULT_DATA);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const payload = await fetchReportDataset<Partial<ExpenseClaimsData>>('accounts.expense-claims');
                if (cancelled) return;
                if (payload) {
                    setData({
                        totalClaims: Number(payload.totalClaims ?? DEFAULT_DATA.totalClaims),
                        totalAmount: Number(payload.totalAmount ?? DEFAULT_DATA.totalAmount),
                        pendingClaims: Number(payload.pendingClaims ?? DEFAULT_DATA.pendingClaims),
                        avgProcessingTime: Number(payload.avgProcessingTime ?? DEFAULT_DATA.avgProcessingTime),
                        byStatus: Array.isArray(payload.byStatus) ? payload.byStatus : DEFAULT_DATA.byStatus,
                        byCategory: Array.isArray(payload.byCategory) ? payload.byCategory : DEFAULT_DATA.byCategory,
                        topClaimants: Array.isArray(payload.topClaimants) ? payload.topClaimants : DEFAULT_DATA.topClaimants,
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
                    <h1 className="text-3xl font-bold mb-2">Expense Claims Report</h1>
                    <p className="text-gray-600">Employee expense tracking and analysis</p>
                </div>
                <div className="flex gap-2">
                    <select value={period} onChange={(e) => setPeriod(e.target.value)} className="px-4 py-2 border rounded-lg">
                        <option value="this-month">This Month</option>
                        <option value="this-quarter">This Quarter</option>
                    </select>
                    <Button variant="outline"><Download className="mr-2 h-4 w-4" />Export</Button>
                </div>
            </div>

            {isLoading && <p className="text-xs text-gray-400 mb-2">Loading latest figures…</p>}
            {loadError && <p className="text-xs text-amber-600 mb-2">Showing sample data — {loadError}</p>}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                <ClickableKPICard
                    title="Total Claims"
                    value={data.totalClaims.toString()}
                    color="blue"
                    onClick={() => router.push('/reports/accounts/expense-claims/status?status=All')}
                />
                <ClickableKPICard
                    title="Total Amount"
                    value={`$${(data.totalAmount / 1000).toFixed(0)}K`}
                    color="green"
                    onClick={() => router.push('/reports/accounts/expense-claims/status?status=All')}
                />
                <ClickableKPICard
                    title="Pending"
                    value={data.pendingClaims.toString()}
                    color="orange"
                    onClick={() => router.push('/reports/accounts/expense-claims/status?status=Submitted')}
                />
                <ClickableKPICard
                    title="Avg Processing"
                    value={data.avgProcessingTime.toString()}
                    color="purple"
                    description="Days"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
                <Card>
                    <CardHeader><CardTitle>Claims by Status</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {data.byStatus.map((item, idx) => (
                                <div key={idx} className="cursor-pointer hover:bg-gray-50 p-1 rounded" onClick={() => router.push(`/reports/accounts/expense-claims/status?status=${item.status}`)}>
                                    <div className="flex justify-between mb-2">
                                        <Badge variant="outline">{item.status}</Badge>
                                        <span className="text-sm"><span className="font-semibold">{item.count} claims</span><span className="text-gray-500 ml-2">(${(item.amount / 1000).toFixed(0)}K)</span></span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(item.count / data.totalClaims) * 100}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Claims by Category</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {data.byCategory.map((item) => (
                                <div key={item.id} className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-1 rounded" onClick={() => router.push(`/reports/accounts/expense-claims/status?category=${item.category}`)}>
                                    <span className="font-medium">{item.category}</span>
                                    <div className="flex items-center gap-3">
                                        <div className="w-24 bg-gray-200 rounded-full h-2">
                                            <div className="bg-green-600 h-2 rounded-full" style={{ width: `${(item.amount / data.totalAmount) * 100}%` }} />
                                        </div>
                                        <span className="font-semibold w-16 text-right">${(item.amount / 1000).toFixed(0)}K</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader><CardTitle>Top Claimants</CardTitle></CardHeader>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Employee</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Department</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Claims</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Total Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {data.topClaimants.map((emp) => (
                                <ClickableTableRow
                                    key={emp.id}
                                    onClick={() => router.push(`/hr/employees/view/${emp.id}`)}
                                >
                                    <td className="px-4 py-3 text-sm font-medium">{emp.name}</td>
                                    <td className="px-4 py-3 text-sm">{emp.dept}</td>
                                    <td className="px-4 py-3 text-center"><Badge variant="outline">{emp.claims}</Badge></td>
                                    <td className="px-4 py-3 text-sm text-right font-semibold text-green-600">${emp.amount.toLocaleString()}</td>
                                </ClickableTableRow>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}
