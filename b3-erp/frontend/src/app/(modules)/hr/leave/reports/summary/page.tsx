'use client';

import React, { useState, useEffect } from 'react';
import {
    BarChart3,
    Download,
    Filter,
    Calendar,
    Users,
    TrendingUp,
    PieChart
} from 'lucide-react';
import { LeaveService } from '@/services/leave.service';

interface LeaveSummary {
    leaveType: string;
    totalDays: number;
    usedDays: number;
    pendingDays: number;
    utilizationRate: number;
    employeesUsed: number;
}

interface MonthlyTrend {
    month: string;
    annual: number;
    sick: number;
    casual: number;
    other: number;
}

export default function LeaveSummaryPage() {
    const [selectedYear, setSelectedYear] = useState('2025');
    const [departmentFilter, setDepartmentFilter] = useState('all');

    const [leaveSummary, setLeaveSummary] = useState<LeaveSummary[]>([]);
    const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true); setLoadError(null);
            try {
                const raw = await LeaveService.getAllLeaveApplicationsRaw();
                const apps = Array.isArray(raw) ? raw : [];

                // Derive summary rows grouped by leave type
                const byType: Record<string, { used: number; pending: number; total: number; emps: Set<string> }> = {};
                apps.forEach((a: any) => {
                    const type = a?.leaveTypeName ?? a?.leaveType ?? 'Other';
                    const days = a?.totalDays ?? 0;
                    const status = String(a?.status ?? '').toUpperCase();
                    if (!byType[type]) byType[type] = { used: 0, pending: 0, total: 0, emps: new Set() };
                    byType[type].total += days;
                    if (status === 'APPROVED') byType[type].used += days;
                    else if (status === 'PENDING') byType[type].pending += days;
                    if (a?.employeeId) byType[type].emps.add(String(a.employeeId));
                });
                const summary: LeaveSummary[] = Object.entries(byType).map(([leaveType, v]) => ({
                    leaveType,
                    totalDays: v.total,
                    usedDays: v.used,
                    pendingDays: v.pending,
                    utilizationRate: v.total > 0 ? Math.round((v.used / v.total) * 100) : 0,
                    employeesUsed: v.emps.size,
                }));

                // Derive monthly trends by leave-type bucket
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const byMonth: Record<string, MonthlyTrend> = {};
                apps.forEach((a: any) => {
                    const d = a?.startDate ? new Date(a.startDate) : null;
                    if (!d || isNaN(d.getTime())) return;
                    const m = monthNames[d.getMonth()];
                    if (!byMonth[m]) byMonth[m] = { month: m, annual: 0, sick: 0, casual: 0, other: 0 };
                    const code = String(a?.leaveTypeCode ?? a?.leaveTypeName ?? '').toUpperCase();
                    const days = a?.totalDays ?? 0;
                    if (code.includes('ANNUAL')) byMonth[m].annual += days;
                    else if (code.includes('SICK')) byMonth[m].sick += days;
                    else if (code.includes('CASUAL')) byMonth[m].casual += days;
                    else byMonth[m].other += days;
                });
                const trends: MonthlyTrend[] = monthNames.filter((m) => byMonth[m]).map((m) => byMonth[m]);

                if (!cancelled) { setLeaveSummary(summary); setMonthlyTrends(trends); }
            } catch (e) {
                if (!cancelled) { setLoadError(e instanceof Error ? e.message : 'Failed to load'); setLeaveSummary([]); setMonthlyTrends([]); }
            } finally { if (!cancelled) setIsLoading(false); }
        })();
        return () => { cancelled = true; };
    }, []);

    const departments = ['Human Resources', 'Production', 'IT', 'Finance', 'Quality Assurance', 'Warehouse'];

    const totalUsed = leaveSummary.reduce((sum, l) => sum + l.usedDays, 0);
    const totalPending = leaveSummary.reduce((sum, l) => sum + l.pendingDays, 0);
    const avgUtilization = leaveSummary.length ? Math.round(leaveSummary.reduce((sum, l) => sum + l.utilizationRate, 0) / leaveSummary.length) : 0;

    const getUtilizationColor = (rate: number) => {
        if (rate >= 50) return 'text-green-400 bg-green-500';
        if (rate >= 30) return 'text-yellow-400 bg-yellow-500';
        return 'text-red-400 bg-red-500';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3">
            <div className="w-full space-y-3">
                {isLoading && (<div className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-300">Loading…</div>)}
                {loadError && !isLoading && (<div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{loadError}</div>)}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <BarChart3 className="w-8 h-8 text-blue-500" />
                            Leave Summary
                        </h1>
                        <p className="text-gray-400 mt-1">Overview of leave usage across the organization</p>
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="2025">2025</option>
                            <option value="2024">2024</option>
                        </select>
                        <select
                            value={departmentFilter}
                            onChange={(e) => setDepartmentFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Departments</option>
                            {departments.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                        <p className="text-blue-400 text-sm">Total Leave Days</p>
                        <p className="text-3xl font-bold text-white">{leaveSummary.reduce((sum, l) => sum + l.totalDays, 0).toLocaleString()}</p>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                        <p className="text-green-400 text-sm">Days Used</p>
                        <p className="text-3xl font-bold text-white">{totalUsed.toLocaleString()}</p>
                    </div>
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                        <p className="text-yellow-400 text-sm">Pending Approval</p>
                        <p className="text-3xl font-bold text-white">{totalPending}</p>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                        <p className="text-purple-400 text-sm">Avg. Utilization</p>
                        <p className="text-3xl font-bold text-white">{avgUtilization}%</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <PieChart className="w-5 h-5 text-gray-400" />
                            Leave Type Breakdown
                        </h3>
                        <div className="space-y-4">
                            {leaveSummary.map((leave) => (
                                <div key={leave.leaveType}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-white">{leave.leaveType}</span>
                                        <span className="text-gray-400">{leave.usedDays} / {leave.totalDays} days ({leave.utilizationRate}%)</span>
                                    </div>
                                    <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${getUtilizationColor(leave.utilizationRate).split(' ')[1]} rounded-full`}
                                            style={{ width: `${leave.utilizationRate}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                                        <span>{leave.employeesUsed} employees</span>
                                        <span>{leave.pendingDays} pending</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-gray-400" />
                            Monthly Trend (Days Used)
                        </h3>
                        <div className="space-y-3">
                            {monthlyTrends.map((month) => {
                                const total = month.annual + month.sick + month.casual + month.other;
                                const maxTotal = Math.max(...monthlyTrends.map(m => m.annual + m.sick + m.casual + m.other));
                                return (
                                    <div key={month.month} className="flex items-center gap-3">
                                        <span className="w-8 text-sm text-gray-400">{month.month}</span>
                                        <div className="flex-1 flex h-6 bg-gray-700 rounded overflow-hidden">
                                            <div
                                                className="bg-blue-500"
                                                style={{ width: `${(month.annual / maxTotal) * 100}%` }}
                                                title={`Annual: ${month.annual}`}
                                            ></div>
                                            <div
                                                className="bg-red-500"
                                                style={{ width: `${(month.sick / maxTotal) * 100}%` }}
                                                title={`Sick: ${month.sick}`}
                                            ></div>
                                            <div
                                                className="bg-green-500"
                                                style={{ width: `${(month.casual / maxTotal) * 100}%` }}
                                                title={`Casual: ${month.casual}`}
                                            ></div>
                                            <div
                                                className="bg-purple-500"
                                                style={{ width: `${(month.other / maxTotal) * 100}%` }}
                                                title={`Other: ${month.other}`}
                                            ></div>
                                        </div>
                                        <span className="w-12 text-right text-sm text-white">{total}</span>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-700">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                                <span className="text-xs text-gray-400">Annual</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-red-500 rounded"></div>
                                <span className="text-xs text-gray-400">Sick</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-500 rounded"></div>
                                <span className="text-xs text-gray-400">Casual</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-purple-500 rounded"></div>
                                <span className="text-xs text-gray-400">Other</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
                    <div className="p-4 border-b border-gray-700">
                        <h3 className="text-lg font-semibold text-white">Leave Usage by Type</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-700">
                                    <th className="text-left p-4 text-gray-400 font-medium">Leave Type</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Total Allotted</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Used</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Pending</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Available</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Utilization</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Employees</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaveSummary.map((leave) => (
                                    <tr key={leave.leaveType} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                                        <td className="p-4 text-white font-medium">{leave.leaveType}</td>
                                        <td className="p-4 text-center text-gray-300">{leave.totalDays.toLocaleString()}</td>
                                        <td className="p-4 text-center text-green-400">{leave.usedDays.toLocaleString()}</td>
                                        <td className="p-4 text-center text-yellow-400">{leave.pendingDays}</td>
                                        <td className="p-4 text-center text-blue-400">{(leave.totalDays - leave.usedDays - leave.pendingDays).toLocaleString()}</td>
                                        <td className="p-4 text-center">
                                            <span className={`px-2 py-1 rounded ${getUtilizationColor(leave.utilizationRate).split(' ')[0]} bg-opacity-20`}>
                                                {leave.utilizationRate}%
                                            </span>
                                        </td>
                                        <td className="p-4 text-center text-gray-300">{leave.employeesUsed}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
