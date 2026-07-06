'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, DollarSign, Users, TrendingUp } from 'lucide-react';
import ClickableKPICard from '@/components/reports/ClickableKPICard';
import ClickableTableRow from '@/components/reports/ClickableTableRow';
import { fetchReportDataset } from '@/services/reports-management.service';

interface PayrollData {
    totalPayroll: number;
    totalEmployees: number;
    avgSalary: number;
    totalDeductions: number;
    netPayroll: number;
    byDepartment: { dept: string; employees: number; gross: number; deductions: number; net: number }[];
    deductionBreakdown: { type: string; amount: number }[];
}

const DEFAULT_DATA: PayrollData = {
    totalPayroll: 1850000,
    totalEmployees: 245,
    avgSalary: 7551,
    totalDeductions: 285000,
    netPayroll: 1565000,
    byDepartment: [
        { dept: 'Production', employees: 85, gross: 520000, deductions: 78000, net: 442000 },
        { dept: 'Engineering', employees: 42, gross: 485000, deductions: 72750, net: 412250 },
        { dept: 'Sales', employees: 38, gross: 420000, deductions: 63000, net: 357000 },
        { dept: 'Admin', employees: 28, gross: 185000, deductions: 27750, net: 157250 },
        { dept: 'Quality', employees: 24, gross: 145000, deductions: 21750, net: 123250 },
        { dept: 'Logistics', employees: 28, gross: 95000, deductions: 14250, net: 80750 },
    ],
    deductionBreakdown: [
        { type: 'Income Tax', amount: 185000 },
        { type: 'Social Security', amount: 55500 },
        { type: 'Health Insurance', amount: 32500 },
        { type: 'Pension', amount: 12000 },
    ],
};

export default function PayrollReport() {
    const router = useRouter();
    const [data, setData] = useState<PayrollData>(DEFAULT_DATA);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const payload = await fetchReportDataset<Partial<PayrollData>>('hr.payroll');
                if (cancelled) return;
                if (payload) {
                    setData({
                        totalPayroll: Number(payload.totalPayroll ?? DEFAULT_DATA.totalPayroll),
                        totalEmployees: Number(payload.totalEmployees ?? DEFAULT_DATA.totalEmployees),
                        avgSalary: Number(payload.avgSalary ?? DEFAULT_DATA.avgSalary),
                        totalDeductions: Number(payload.totalDeductions ?? DEFAULT_DATA.totalDeductions),
                        netPayroll: Number(payload.netPayroll ?? DEFAULT_DATA.netPayroll),
                        byDepartment: Array.isArray(payload.byDepartment) ? payload.byDepartment : DEFAULT_DATA.byDepartment,
                        deductionBreakdown: Array.isArray(payload.deductionBreakdown) ? payload.deductionBreakdown : DEFAULT_DATA.deductionBreakdown,
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
                    <h1 className="text-3xl font-bold mb-2">Payroll Report</h1>
                    <p className="text-gray-600">Employee compensation analysis</p>
                </div>
                <Button variant="outline"><Download className="mr-2 h-4 w-4" />Export</Button>
            </div>

            {isLoading && <p className="text-xs text-gray-400 mb-2">Loading latest figures…</p>}
            {loadError && <p className="text-xs text-amber-600 mb-2">Showing sample data — {loadError}</p>}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                <ClickableKPICard
                    title="Total Payroll"
                    value={`$${(data.totalPayroll / 1000).toFixed(0)}K`}
                    icon={DollarSign}
                    onClick={() => router.push('/reports/hr/payroll/department?department=All Departments')}
                />
                <ClickableKPICard
                    title="Total Deductions"
                    value={`$${(data.totalDeductions / 1000).toFixed(0)}K`}
                    icon={TrendingUp}
                    onClick={() => router.push('/reports/hr/payroll/department?status=Deductions')}
                />
                <ClickableKPICard
                    title="Net Payroll"
                    value={`$${(data.netPayroll / 1000).toFixed(0)}K`}
                    icon={DollarSign}
                    onClick={() => router.push('/reports/hr/payroll/department?status=Paid')}
                />
                <ClickableKPICard
                    title="Avg Salary"
                    value={`$${data.avgSalary.toLocaleString()}`}
                    icon={Users}
                    onClick={() => router.push('/reports/hr/payroll/department?department=All Departments')}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
                <Card>
                    <CardHeader><CardTitle>Deduction Breakdown</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {data.deductionBreakdown.map((item, idx) => (
                                <div key={idx}>
                                    <div className="flex justify-between mb-2">
                                        <span className="font-medium">{item.type}</span>
                                        <span className="font-semibold">${(item.amount / 1000).toFixed(0)}K</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-red-600 h-2 rounded-full" style={{ width: `${(item.amount / data.totalDeductions) * 100}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader><CardTitle>Payroll by Department</CardTitle></CardHeader>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Department</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Employees</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Gross</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Deductions</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Net</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {data.byDepartment.map((dept, idx) => (
                                <ClickableTableRow
                                    key={idx}
                                    id={dept.dept}
                                    basePath="/reports/hr/payroll/department"
                                    queryParam="department"
                                >
                                    <td className="px-4 py-3 text-sm font-medium">{dept.dept}</td>
                                    <td className="px-4 py-3 text-center text-sm">{dept.employees}</td>
                                    <td className="px-4 py-3 text-sm text-right text-blue-600">${(dept.gross / 1000).toFixed(0)}K</td>
                                    <td className="px-4 py-3 text-sm text-right text-red-600">${(dept.deductions / 1000).toFixed(0)}K</td>
                                    <td className="px-4 py-3 text-sm text-right font-semibold text-green-600">${(dept.net / 1000).toFixed(0)}K</td>
                                </ClickableTableRow>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}
