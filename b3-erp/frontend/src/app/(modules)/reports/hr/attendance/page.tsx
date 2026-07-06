'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import ClickableKPICard from '@/components/reports/ClickableKPICard';
import ClickableTableRow from '@/components/reports/ClickableTableRow';
import { fetchReportDataset } from '@/services/reports-management.service';

interface AttendanceData {
    totalEmployees: number;
    avgAttendance: number;
    presentToday: number;
    absentToday: number;
    lateToday: number;
    absenteeismRate: number;
    overtimeHours: number;
    byDepartment: { dept: string; employees: number; attendance: number; late: number; absent: number }[];
    weeklyTrend: { day: string; present: number; absent: number }[];
}

const DEFAULT_DATA: AttendanceData = {
    totalEmployees: 245,
    avgAttendance: 96.5,
    presentToday: 238,
    absentToday: 4,
    lateToday: 3,
    absenteeismRate: 3.5,
    overtimeHours: 1240,
    byDepartment: [
        { dept: 'Production', employees: 85, attendance: 95.2, late: 8, absent: 4 },
        { dept: 'Engineering', employees: 42, attendance: 97.8, late: 2, absent: 1 },
        { dept: 'Sales', employees: 38, attendance: 98.1, late: 1, absent: 1 },
        { dept: 'Admin', employees: 28, attendance: 96.4, late: 2, absent: 1 },
        { dept: 'Quality', employees: 24, attendance: 97.5, late: 1, absent: 1 },
        { dept: 'Logistics', employees: 28, attendance: 94.6, late: 3, absent: 2 },
    ],
    weeklyTrend: [
        { day: 'Mon', present: 241, absent: 4 },
        { day: 'Tue', present: 242, absent: 3 },
        { day: 'Wed', present: 240, absent: 5 },
        { day: 'Thu', present: 243, absent: 2 },
        { day: 'Fri', present: 238, absent: 7 },
    ],
};

export default function AttendanceReport() {
    const router = useRouter();
    const [period, setPeriod] = useState('this-month');
    const [data, setData] = useState<AttendanceData>(DEFAULT_DATA);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const payload = await fetchReportDataset<Partial<AttendanceData>>('hr.attendance');
                if (cancelled) return;
                if (payload) {
                    setData({
                        totalEmployees: Number(payload.totalEmployees ?? DEFAULT_DATA.totalEmployees),
                        avgAttendance: Number(payload.avgAttendance ?? DEFAULT_DATA.avgAttendance),
                        presentToday: Number(payload.presentToday ?? DEFAULT_DATA.presentToday),
                        absentToday: Number(payload.absentToday ?? DEFAULT_DATA.absentToday),
                        lateToday: Number(payload.lateToday ?? DEFAULT_DATA.lateToday),
                        absenteeismRate: Number(payload.absenteeismRate ?? DEFAULT_DATA.absenteeismRate),
                        overtimeHours: Number(payload.overtimeHours ?? DEFAULT_DATA.overtimeHours),
                        byDepartment: Array.isArray(payload.byDepartment) ? payload.byDepartment : DEFAULT_DATA.byDepartment,
                        weeklyTrend: Array.isArray(payload.weeklyTrend) ? payload.weeklyTrend : DEFAULT_DATA.weeklyTrend,
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
                    <h1 className="text-3xl font-bold mb-2">Attendance Report</h1>
                    <p className="text-gray-600">Employee attendance tracking and analysis</p>
                </div>
                <div className="flex gap-2">
                    <select value={period} onChange={(e) => setPeriod(e.target.value)} className="px-4 py-2 border rounded-lg">
                        <option value="today">Today</option>
                        <option value="this-week">This Week</option>
                        <option value="this-month">This Month</option>
                    </select>
                    <Button variant="outline"><Download className="mr-2 h-4 w-4" />Export</Button>
                </div>
            </div>

            {isLoading && <p className="text-xs text-gray-400 mb-2">Loading latest figures…</p>}
            {loadError && <p className="text-xs text-amber-600 mb-2">Showing sample data — {loadError}</p>}

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-3">
                <ClickableKPICard
                    title="Avg Attendance"
                    value={`${data.avgAttendance}%`}
                    icon={CheckCircle}
                    onClick={() => router.push('/reports/hr/attendance/department?department=All Departments')}
                />
                <ClickableKPICard
                    title="Present Today"
                    value={data.presentToday.toString()}
                    icon={Users}
                    subtext={`of ${data.totalEmployees}`}
                    onClick={() => router.push('/reports/hr/attendance/department?status=Present')}
                />
                <ClickableKPICard
                    title="Absent"
                    value={data.absentToday.toString()}
                    icon={XCircle}
                    onClick={() => router.push('/reports/hr/attendance/department?status=Absent')}
                />
                <ClickableKPICard
                    title="Late Arrivals"
                    value={data.lateToday.toString()}
                    icon={Clock}
                    onClick={() => router.push('/reports/hr/attendance/department?status=Late')}
                />
                <ClickableKPICard
                    title="Overtime Hours"
                    value={data.overtimeHours.toString()}
                    icon={Clock}
                    subtext="This month"
                    onClick={() => router.push('/reports/hr/attendance/department?status=Overtime')}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
                <Card>
                    <CardHeader><CardTitle>Attendance by Department</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {data.byDepartment.map((dept, idx) => (
                                <div key={idx} className="cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors" onClick={() => router.push(`/reports/hr/attendance/department?department=${dept.dept}`)}>
                                    <div className="flex justify-between mb-2">
                                        <span className="font-medium">{dept.dept}</span>
                                        <span className="text-sm">
                                            <span className="font-semibold">{dept.attendance}%</span>
                                            <span className="text-gray-500 ml-2">({dept.employees} emp)</span>
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className={`h-2 rounded-full ${dept.attendance >= 97 ? 'bg-green-600' : dept.attendance >= 95 ? 'bg-blue-600' : 'bg-orange-600'}`} style={{ width: `${dept.attendance}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Weekly Attendance Trend</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {data.weeklyTrend.map((day, idx) => (
                                <div key={idx} className="flex items-center justify-between">
                                    <span className="font-medium w-12">{day.day}</span>
                                    <div className="flex-1 mx-4">
                                        <div className="w-full bg-gray-200 rounded-full h-6">
                                            <div className="bg-green-600 h-6 rounded-full flex items-center px-2" style={{ width: `${(day.present / data.totalEmployees) * 100}%` }}>
                                                <span className="text-xs text-white font-medium">{day.present}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-sm text-red-600">{day.absent} absent</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader><CardTitle>Department Details</CardTitle></CardHeader>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Department</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Employees</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Attendance %</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Late</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Absent</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {data.byDepartment.map((dept, idx) => (
                                <ClickableTableRow
                                    key={idx}
                                    id={dept.dept}
                                    basePath="/reports/hr/attendance/department"
                                    queryParam="department"
                                >
                                    <td className="px-4 py-3 text-sm font-medium">{dept.dept}</td>
                                    <td className="px-4 py-3 text-center text-sm">{dept.employees}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`font-semibold ${dept.attendance >= 97 ? 'text-green-600' : dept.attendance >= 95 ? 'text-blue-600' : 'text-orange-600'}`}>
                                            {dept.attendance}%
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center text-orange-600">{dept.late}</td>
                                    <td className="px-4 py-3 text-center text-red-600">{dept.absent}</td>
                                </ClickableTableRow>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}
