'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Calendar, Users, CheckCircle, XCircle } from 'lucide-react';
import { fetchReportDataset } from '@/services/reports-management.service';

interface LeaveData {
    totalRequests: number;
    approved: number;
    pending: number;
    rejected: number;
    approvalRate: number;
    avgLeaveDays: number;
    byType: { type: string; count: number; days: number }[];
    byDepartment: { dept: string; requests: number; days: number }[];
}

const DEFAULT_DATA: LeaveData = {
    totalRequests: 124,
    approved: 98,
    pending: 18,
    rejected: 8,
    approvalRate: 79.0,
    avgLeaveDays: 2.3,
    byType: [
        { type: 'Annual Leave', count: 52, days: 148 },
        { type: 'Sick Leave', count: 38, days: 52 },
        { type: 'Personal Leave', count: 24, days: 36 },
        { type: 'Emergency', count: 10, days: 12 },
    ],
    byDepartment: [
        { dept: 'Production', requests: 32, days: 68 },
        { dept: 'Sales', requests: 28, days: 75 },
        { dept: 'Engineering', requests: 24, days: 52 },
        { dept: 'Admin', requests: 18, days: 38 },
        { dept: 'Quality', requests: 12, days: 24 },
        { dept: 'Logistics', requests: 10, days: 21 },
    ],
};

export default function LeaveReport() {
    const [period, setPeriod] = useState('this-month');
    const [data, setData] = useState<LeaveData>(DEFAULT_DATA);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const payload = await fetchReportDataset<Partial<LeaveData>>('hr.leave');
                if (cancelled) return;
                if (payload) {
                    setData({
                        totalRequests: Number(payload.totalRequests ?? DEFAULT_DATA.totalRequests),
                        approved: Number(payload.approved ?? DEFAULT_DATA.approved),
                        pending: Number(payload.pending ?? DEFAULT_DATA.pending),
                        rejected: Number(payload.rejected ?? DEFAULT_DATA.rejected),
                        approvalRate: Number(payload.approvalRate ?? DEFAULT_DATA.approvalRate),
                        avgLeaveDays: Number(payload.avgLeaveDays ?? DEFAULT_DATA.avgLeaveDays),
                        byType: Array.isArray(payload.byType) ? payload.byType : DEFAULT_DATA.byType,
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
                    <h1 className="text-3xl font-bold mb-2">Leave Report</h1>
                    <p className="text-gray-600">Employee leave tracking and analysis</p>
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

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-3">
                <Card><CardContent className="pt-6"><p className="text-sm text-gray-600">Total Requests</p><p className="text-2xl font-bold">{data.totalRequests}</p></CardContent></Card>
                <Card><CardContent className="pt-6"><p className="text-sm text-gray-600">Approved</p><p className="text-2xl font-bold text-green-600">{data.approved}</p></CardContent></Card>
                <Card><CardContent className="pt-6"><p className="text-sm text-gray-600">Pending</p><p className="text-2xl font-bold text-orange-600">{data.pending}</p></CardContent></Card>
                <Card><CardContent className="pt-6"><p className="text-sm text-gray-600">Rejected</p><p className="text-2xl font-bold text-red-600">{data.rejected}</p></CardContent></Card>
                <Card><CardContent className="pt-6"><p className="text-sm text-gray-600">Approval Rate</p><p className="text-2xl font-bold text-blue-600">{data.approvalRate}%</p></CardContent></Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
                <Card>
                    <CardHeader><CardTitle>Leave by Type</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {data.byType.map((item, idx) => (
                                <div key={idx}>
                                    <div className="flex justify-between mb-2">
                                        <span className="font-medium">{item.type}</span>
                                        <span className="text-sm"><span className="font-semibold">{item.count} requests</span><span className="text-gray-500 ml-2">({item.days} days)</span></span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(item.count / data.totalRequests) * 100}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Leave by Department</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {data.byDepartment.map((dept, idx) => (
                                <div key={idx} className="flex items-center justify-between">
                                    <span className="font-medium">{dept.dept}</span>
                                    <div className="flex items-center gap-3">
                                        <div className="w-24 bg-gray-200 rounded-full h-2">
                                            <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${(dept.requests / data.totalRequests) * 100}%` }} />
                                        </div>
                                        <span className="text-sm font-semibold w-16 text-right">{dept.requests} ({dept.days}d)</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
