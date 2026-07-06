'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp, Users, Award, AlertCircle } from 'lucide-react';
import ClickableKPICard from '@/components/reports/ClickableKPICard';
import ClickableTableRow from '@/components/reports/ClickableTableRow';
import { fetchReportDataset } from '@/services/reports-management.service';

interface PerformanceData {
    avgRating: number;
    totalEmployees: number;
    highPerformers: number;
    lowPerformers: number;
    reviewsDue: number;
    byDepartment: { dept: string; employees: number; avgRating: number; high: number; low: number }[];
}

const DEFAULT_DATA: PerformanceData = {
    avgRating: 4.2,
    totalEmployees: 245,
    highPerformers: 45,
    lowPerformers: 12,
    reviewsDue: 8,
    byDepartment: [
        { dept: 'Production', employees: 85, avgRating: 4.1, high: 15, low: 5 },
        { dept: 'Engineering', employees: 42, avgRating: 4.5, high: 12, low: 1 },
        { dept: 'Sales', employees: 38, avgRating: 4.3, high: 10, low: 2 },
        { dept: 'Admin', employees: 28, avgRating: 4.0, high: 4, low: 2 },
        { dept: 'Quality', employees: 24, avgRating: 4.2, high: 3, low: 1 },
        { dept: 'Logistics', employees: 28, avgRating: 3.9, high: 1, low: 1 },
    ],
};

export default function PerformanceReport() {
    const router = useRouter();
    const [data, setData] = useState<PerformanceData>(DEFAULT_DATA);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const payload = await fetchReportDataset<Partial<PerformanceData>>('hr.performance');
                if (cancelled) return;
                if (payload) {
                    setData({
                        avgRating: Number(payload.avgRating ?? DEFAULT_DATA.avgRating),
                        totalEmployees: Number(payload.totalEmployees ?? DEFAULT_DATA.totalEmployees),
                        highPerformers: Number(payload.highPerformers ?? DEFAULT_DATA.highPerformers),
                        lowPerformers: Number(payload.lowPerformers ?? DEFAULT_DATA.lowPerformers),
                        reviewsDue: Number(payload.reviewsDue ?? DEFAULT_DATA.reviewsDue),
                        byDepartment: Array.isArray(payload.byDepartment) ? payload.byDepartment : DEFAULT_DATA.byDepartment,
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
                    <h1 className="text-3xl font-bold mb-2">Performance Metrics</h1>
                    <p className="text-gray-600">Employee performance evaluation analysis</p>
                </div>
                <Button variant="outline"><Download className="mr-2 h-4 w-4" />Export</Button>
            </div>

            {isLoading && <p className="text-xs text-gray-400 mb-2">Loading latest figures…</p>}
            {loadError && <p className="text-xs text-amber-600 mb-2">Showing sample data — {loadError}</p>}

            <div className="grid grid-cols-1 md://grid-cols-4 gap-3 mb-3">
                <ClickableKPICard
                    title="Avg Rating"
                    value={data.avgRating.toString()}
                    icon={TrendingUp}
                    trend="+0.2 vs last qtr"
                    trendUp={true}
                    onClick={() => router.push('/reports/hr/performance/department?department=All Departments')}
                />
                <ClickableKPICard
                    title="High Performers"
                    value={data.highPerformers.toString()}
                    icon={Award}
                    subtext="Rating > 4.5"
                    onClick={() => router.push('/reports/hr/performance/department?status=Outstanding')}
                />
                <ClickableKPICard
                    title="Low Performers"
                    value={data.lowPerformers.toString()}
                    icon={AlertCircle}
                    subtext="Rating < 3.0"
                    onClick={() => router.push('/reports/hr/performance/department?status=Average')}
                />
                <ClickableKPICard
                    title="Reviews Due"
                    value={data.reviewsDue.toString()}
                    icon={Users}
                    subtext="This Month"
                    onClick={() => router.push('/reports/hr/performance/department?status=Pending')}
                />
            </div>

            <Card>
                <CardHeader><CardTitle>Performance by Department</CardTitle></CardHeader>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Department</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Employees</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Avg Rating</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">High Performers</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Low Performers</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {data.byDepartment.map((dept, idx) => (
                                <ClickableTableRow
                                    key={idx}
                                    id={dept.dept}
                                    basePath="/reports/hr/performance/department"
                                    queryParam="department"
                                >
                                    <td className="px-4 py-3 text-sm font-medium">{dept.dept}</td>
                                    <td className="px-4 py-3 text-center text-sm">{dept.employees}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`font-semibold ${dept.avgRating >= 4.0 ? 'text-green-600' : 'text-orange-600'}`}>
                                            {dept.avgRating}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center text-green-600">{dept.high}</td>
                                    <td className="px-4 py-3 text-center text-red-600">{dept.low}</td>
                                </ClickableTableRow>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}
