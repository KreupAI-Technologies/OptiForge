'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Users, TrendingUp, Award } from 'lucide-react';
import { fetchReportDataset } from '@/services/reports-management.service';

interface HeadcountData {
    totalEmployees: number;
    newHires: number;
    terminations: number;
    turnoverRate: number;
    byDepartment: { dept: string; count: number; change: number }[];
    byType: { type: string; count: number }[];
    demographics: { avgAge: number; avgTenure: number; maleCount: number; femaleCount: number };
}

const DEFAULT_DATA: HeadcountData = {
    totalEmployees: 245,
    newHires: 12,
    terminations: 5,
    turnoverRate: 8.2,
    byDepartment: [
        { dept: 'Production', count: 85, change: +5 },
        { dept: 'Engineering', count: 42, change: +2 },
        { dept: 'Sales', count: 38, change: +1 },
        { dept: 'Admin', count: 28, change: 0 },
        { dept: 'Quality', count: 24, change: +2 },
        { dept: 'Logistics', count: 28, change: +2 },
    ],
    byType: [
        { type: 'Full-time', count: 215 },
        { type: 'Part-time', count: 18 },
        { type: 'Contract', count: 12 },
    ],
    demographics: {
        avgAge: 35.5,
        avgTenure: 4.2,
        maleCount: 158,
        femaleCount: 87,
    },
};

export default function HeadcountReport() {
    const [period, setPeriod] = useState('current');
    const [data, setData] = useState<HeadcountData>(DEFAULT_DATA);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const payload = await fetchReportDataset<Partial<HeadcountData>>('hr.headcount');
                if (cancelled) return;
                if (payload) {
                    setData({
                        totalEmployees: Number(payload.totalEmployees ?? DEFAULT_DATA.totalEmployees),
                        newHires: Number(payload.newHires ?? DEFAULT_DATA.newHires),
                        terminations: Number(payload.terminations ?? DEFAULT_DATA.terminations),
                        turnoverRate: Number(payload.turnoverRate ?? DEFAULT_DATA.turnoverRate),
                        byDepartment: Array.isArray(payload.byDepartment) ? payload.byDepartment : DEFAULT_DATA.byDepartment,
                        byType: Array.isArray(payload.byType) ? payload.byType : DEFAULT_DATA.byType,
                        demographics: payload.demographics ?? DEFAULT_DATA.demographics,
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
                    <h1 className="text-3xl font-bold mb-2">Headcount Report</h1>
                    <p className="text-gray-600">Employee demographics and distribution</p>
                </div>
                <Button variant="outline"><Download className="mr-2 h-4 w-4" />Export</Button>
            </div>

            {isLoading && <p className="text-xs text-gray-400 mb-2">Loading latest figures…</p>}
            {loadError && <p className="text-xs text-amber-600 mb-2">Showing sample data — {loadError}</p>}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                <Card><CardContent className="pt-6"><p className="text-sm text-gray-600">Total Employees</p><p className="text-2xl font-bold text-blue-600">{data.totalEmployees}</p></CardContent></Card>
                <Card><CardContent className="pt-6"><p className="text-sm text-gray-600">New Hires</p><p className="text-2xl font-bold text-green-600">+{data.newHires}</p><p className="text-xs text-gray-500 mt-1">This month</p></CardContent></Card>
                <Card><CardContent className="pt-6"><p className="text-sm text-gray-600">Terminations</p><p className="text-2xl font-bold text-red-600">-{data.terminations}</p><p className="text-xs text-gray-500 mt-1">This month</p></CardContent></Card>
                <Card><CardContent className="pt-6"><p className="text-sm text-gray-600">Turnover Rate</p><p className="text-2xl font-bold text-orange-600">{data.turnoverRate}%</p><p className="text-xs text-gray-500 mt-1">Annual</p></CardContent></Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
                <Card>
                    <CardHeader><CardTitle>Headcount by Department</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {data.byDepartment.map((dept, idx) => (
                                <div key={idx} className="flex items-center justify-between">
                                    <span className="font-medium">{dept.dept}</span>
                                    <div className="flex items-center gap-3">
                                        <div className="w-32 bg-gray-200 rounded-full h-2">
                                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(dept.count / data.totalEmployees) * 100}%` }} />
                                        </div>
                                        <span className="font-semibold w-12 text-right">{dept.count}</span>
                                        {dept.change !== 0 && (
                                            <span className={`text-xs ${dept.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                ({dept.change > 0 ? '+' : ''}{dept.change})
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Employee Type</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {data.byType.map((type, idx) => (
                                <div key={idx}>
                                    <div className="flex justify-between mb-2">
                                        <span className="font-medium">{type.type}</span>
                                        <span className="font-semibold">{type.count} ({((type.count / data.totalEmployees) * 100).toFixed(0)}%)</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <div className="bg-purple-600 h-3 rounded-full" style={{ width: `${(type.count / data.totalEmployees) * 100}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader><CardTitle>Demographics</CardTitle></CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div><p className="text-sm text-gray-600 mb-2">Average Age</p><p className="text-xl font-bold text-blue-600">{data.demographics.avgAge} years</p></div>
                        <div><p className="text-sm text-gray-600 mb-2">Average Tenure</p><p className="text-xl font-bold text-green-600">{data.demographics.avgTenure} years</p></div>
                        <div><p className="text-sm text-gray-600 mb-2">Gender Distribution</p><p className="text-xl font-bold">M: {data.demographics.maleCount} / F: {data.demographics.femaleCount}</p></div>
                        <div><p className="text-sm text-gray-600 mb-2">Growth Rate</p><p className="text-xl font-bold text-purple-600">+{(((data.newHires - data.terminations) / data.totalEmployees) * 100).toFixed(1)}%</p></div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
