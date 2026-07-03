'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ReportDetailPage } from '@/components/reports/ReportDetailPage';
import { exportToCsv } from '@/lib/export';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClickableTableRow } from '@/components/reports/ClickableTableRow';
import { Badge } from '@/components/ui/badge';

export default function PLExpensesDetail() {
    const router = useRouter();

    const expensesData = [
        { id: 'EXP-001', date: '2025-01-22', category: 'Salaries', employee: 'All Employees', amount: 450000, type: 'Payroll' },
        { id: 'EXP-002', date: '2025-01-20', category: 'Rent', vendor: 'Property Management Inc', amount: 85000, type: 'Facility' },
        { id: 'EXP-003', date: '2025-01-18', category: 'Utilities', vendor: 'Power Corporation', amount: 32000, type: 'Utility' },
        { id: 'EXP-004', date: '2025-01-15', category: 'Marketing', vendor: 'Digital Ads Co', amount: 75000, type: 'Marketing' },
        { id: 'EXP-005', date: '2025-01-12', category: 'Travel', employee: 'Sales Team', amount: 28000, type: 'Travel' },
    ];

    const handleExpenseClick = (expenseId: string) => {
        router.push(`/accounts/expense-claims/${expenseId}`);
    };

    return (
        <ReportDetailPage
            title="Expenses Breakdown"
            description="Detailed operating expense transactions"
            breadcrumbs={[
                { label: 'Reports', href: '/reports' },
                { label: 'Finance', href: '/reports' },
                { label: 'Profit & Loss', href: '/reports/finance/pl' },
                { label: 'Expenses' },
            ]}
            onBack={() => router.back()}
            onExport={() => exportToCsv('pl-expenses', expensesData)}
        >
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-gray-600">Total Expenses</p>
                        <p className="text-2xl font-bold text-red-600">₹6.7L</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-gray-600">Transactions</p>
                        <p className="text-2xl font-bold">5</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-gray-600">Top Category</p>
                        <p className="text-2xl font-bold text-blue-600">Salaries</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-gray-600">Avg Expense</p>
                        <p className="text-2xl font-bold">₹1.34L</p>
                    </CardContent>
                </Card>
            </div>

            {/* Expenses Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Expense Transactions</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Category</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Payee</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Type</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {expensesData.map((item) => (
                                <ClickableTableRow
                                    key={item.id}
                                    onClick={() => handleExpenseClick(item.id)}
                                >
                                    <td className="px-4 py-3 text-sm">{item.date}</td>
                                    <td className="px-4 py-3 text-sm font-medium">{item.category}</td>
                                    <td className="px-4 py-3 text-sm">{item.employee || item.vendor}</td>
                                    <td className="px-4 py-3 text-sm">
                                        <Badge variant="outline">{item.type}</Badge>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right font-semibold text-red-600">
                                        ₹{(item.amount / 1000).toFixed(0)}K
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
