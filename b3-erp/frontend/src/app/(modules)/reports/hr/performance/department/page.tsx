'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ReportDetailPage from '@/components/reports/ReportDetailPage';
import ClickableTableRow from '@/components/reports/ClickableTableRow';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import { fetchDomainList } from '@/services/reports-data.service';

function PerformanceByDepartmentContent() {
    const searchParams = useSearchParams();
    const department = searchParams.get('department') || 'All Departments';

    const [performanceData, setPerformanceData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const raw = await fetchDomainList<any>('hr/performance-reviews');
                const mapped = raw.map((r: any) => ({
                    id: r.id ?? '',
                    employeeId: r.employeeId ?? r.employeeCode ?? '',
                    name: r.employeeName ?? r.name ?? '',
                    department: r.department ?? '',
                    role: r.role ?? r.designation ?? '',
                    rating: Number(r.rating ?? r.score ?? 0),
                    lastReview: r.reviewPeriod ?? r.reviewDate ?? r.lastReview ?? '',
                    status: r.status ?? '',
                }));
                if (!cancelled) setPerformanceData(mapped);
            } catch (e) {
                if (!cancelled) {
                    setLoadError(e instanceof Error ? e.message : 'Failed to load');
                    setPerformanceData([]);
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    // Filter data based on department
    const filteredData = department === 'All Departments'
        ? performanceData
        : performanceData.filter(item => item.department === department);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Outstanding': return 'bg-purple-100 text-purple-800';
            case 'Excellent': return 'bg-green-100 text-green-800';
            case 'Very Good': return 'bg-blue-100 text-blue-800';
            case 'Good': return 'bg-yellow-100 text-yellow-800';
            case 'Average': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <ReportDetailPage
            title={`Performance - ${department}`}
            description="Employee performance ratings by department"
            breadcrumbs={[
                { label: 'Reports', href: '/reports' },
                { label: 'HR', href: '/reports/hr' },
                { label: 'Performance', href: '/reports/hr/performance' },
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
                                <th className="px-3 py-2">Role</th>
                                <th className="px-3 py-2">Rating</th>
                                <th className="px-3 py-2">Last Review</th>
                                <th className="px-3 py-2">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredData.map((record) => (
                                <ClickableTableRow
                                    key={record.id}
                                    id={record.id}
                                    basePath="/hr/employees/view"
                                >
                                    <td className="px-3 py-2 font-medium text-gray-900">{record.employeeId}</td>
                                    <td className="px-3 py-2">{record.name}</td>
                                    <td className="px-3 py-2">{record.department}</td>
                                    <td className="px-3 py-2">{record.role}</td>
                                    <td className="px-3 py-2">
                                        <div className="flex items-center">
                                            <span className="mr-1 font-medium">{record.rating}</span>
                                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                        </div>
                                    </td>
                                    <td className="px-3 py-2">{record.lastReview}</td>
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

export default function PerformanceByDepartmentPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PerformanceByDepartmentContent />
        </Suspense>
    );
}
