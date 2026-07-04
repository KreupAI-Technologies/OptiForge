'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ReportDetailPage from '@/components/reports/ReportDetailPage';
import ClickableTableRow from '@/components/reports/ClickableTableRow';
import { Badge } from '@/components/ui/badge';
import { fetchDomainList } from '@/services/reports-data.service';

function PayrollByDepartmentContent() {
    const searchParams = useSearchParams();
    const department = searchParams.get('department') || 'All Departments';

    const [payrollData, setPayrollData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const raw = await fetchDomainList<any>('hr/payrolls');
                const mapped = raw.map((r: any) => {
                    const gross = Number(r.grossSalary ?? r.gross ?? r.totalAmount ?? 0);
                    const deductions = Number(r.deductions ?? r.totalDeductions ?? 0);
                    const net = Number(r.netSalary ?? r.net ?? (gross - deductions));
                    return {
                        id: r.id ?? '',
                        employeeId: r.employeeId ?? r.employeeCode ?? '',
                        name: r.employeeName ?? r.name ?? '',
                        department: r.department ?? '',
                        position: r.position ?? r.designation ?? '',
                        gross,
                        deductions,
                        net,
                        status: r.status ?? '',
                    };
                });
                if (!cancelled) setPayrollData(mapped);
            } catch (e) {
                if (!cancelled) {
                    setLoadError(e instanceof Error ? e.message : 'Failed to load');
                    setPayrollData([]);
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    // Filter data based on department
    const filteredData = department === 'All Departments'
        ? payrollData
        : payrollData.filter(item => item.department === department);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Paid': return 'bg-green-100 text-green-800';
            case 'Processing': return 'bg-blue-100 text-blue-800';
            case 'Pending': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <ReportDetailPage
            title={`Payroll - ${department}`}
            description="Detailed payroll records by department"
            breadcrumbs={[
                { label: 'Reports', href: '/reports' },
                { label: 'HR', href: '/reports/hr' },
                { label: 'Payroll', href: '/reports/hr/payroll' },
                { label: department }
            ]}
        >
            <>
            {isLoading && <div className="mb-3 rounded border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">Loading…</div>}
            {loadError && !isLoading && <div className="mb-3 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{loadError}</div>}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                            <tr>
                                <th className="px-3 py-2">Employee ID</th>
                                <th className="px-3 py-2">Name</th>
                                <th className="px-3 py-2">Department</th>
                                <th className="px-3 py-2">Position</th>
                                <th className="px-3 py-2 text-right">Gross Salary</th>
                                <th className="px-3 py-2 text-right">Deductions</th>
                                <th className="px-3 py-2 text-right">Net Salary</th>
                                <th className="px-3 py-2">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredData.map((record) => (
                                <ClickableTableRow
                                    key={record.id}
                                    id={record.id}
                                    basePath="/hr/payroll/view"
                                >
                                    <td className="px-3 py-2 font-medium text-gray-900">{record.employeeId}</td>
                                    <td className="px-3 py-2">{record.name}</td>
                                    <td className="px-3 py-2">{record.department}</td>
                                    <td className="px-3 py-2">{record.position}</td>
                                    <td className="px-3 py-2 text-right">${record.gross.toLocaleString()}</td>
                                    <td className="px-3 py-2 text-right text-red-600">${record.deductions.toLocaleString()}</td>
                                    <td className="px-3 py-2 text-right font-medium text-green-600">${record.net.toLocaleString()}</td>
                                    <td className="px-3 py-2">
                                        <Badge className={getStatusColor(record.status)}>
                                            {record.status}
                                        </Badge>
                                    </td>
                                </ClickableTableRow>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            </>
        </ReportDetailPage>
    );
}

export default function PayrollByDepartmentPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PayrollByDepartmentContent />
        </Suspense>
    );
}
