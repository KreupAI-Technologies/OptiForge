'use client';

import React, { useState, useEffect } from 'react';
import {
    LineChart,
    Download,
    TrendingUp,
    TrendingDown,
    Calendar,
    Users,
    AlertCircle,
    BarChart3
} from 'lucide-react';
import { LeaveService } from '@/services/leave.service';

interface Metric {
    label: string;
    value: string;
    change: number;
    trend: 'up' | 'down';
}

interface LeavePattern {
    day: string;
    requests: number;
}

export default function LeaveAnalyticsPage() {
    const [selectedPeriod, setSelectedPeriod] = useState('quarter');

    const metrics: Metric[] = [
        { label: 'Leave Utilization Rate', value: '38%', change: 5, trend: 'up' },
        { label: 'Avg. Days per Employee', value: '10.2', change: -2, trend: 'down' },
        { label: 'Pending Approval Rate', value: '12%', change: -3, trend: 'down' },
        { label: 'Encashment Requests', value: '24', change: 8, trend: 'up' }
    ];

    const [weekdayPatterns, setWeekdayPatterns] = useState<LeavePattern[]>([]);
    const [monthlyTrends, setMonthlyTrends] = useState<{ month: string; value: number }[]>([]);
    const [topLeaveReasons, setTopLeaveReasons] = useState<{ reason: string; percentage: number }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true); setLoadError(null);
            try {
                const raw = await LeaveService.getAllLeaveApplicationsRaw();
                const apps = Array.isArray(raw) ? raw : [];

                // Derive weekday patterns from application start dates
                const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
                const dayCounts: Record<string, number> = { Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0 };
                const allDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                apps.forEach((a: any) => {
                    const d = a?.startDate ? new Date(a.startDate) : null;
                    if (d && !isNaN(d.getTime())) {
                        const name = allDays[d.getDay()];
                        if (name in dayCounts) dayCounts[name] += 1;
                    }
                });
                const wp: LeavePattern[] = dayNames.map((day) => ({ day, requests: dayCounts[day] ?? 0 }));

                // Derive monthly trends from application start dates
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const monthCounts: Record<string, number> = {};
                apps.forEach((a: any) => {
                    const d = a?.startDate ? new Date(a.startDate) : null;
                    if (d && !isNaN(d.getTime())) {
                        const m = monthNames[d.getMonth()];
                        monthCounts[m] = (monthCounts[m] ?? 0) + 1;
                    }
                });
                const mt = monthNames.filter((m) => monthCounts[m] != null).map((month) => ({ month, value: monthCounts[month] }));

                // Derive top leave reasons
                const reasonCounts: Record<string, number> = {};
                apps.forEach((a: any) => {
                    const reason = a?.reason ?? 'Other';
                    reasonCounts[reason] = (reasonCounts[reason] ?? 0) + 1;
                });
                const total = apps.length || 1;
                const tr = Object.entries(reasonCounts)
                    .map(([reason, count]) => ({ reason, percentage: Math.round((count / total) * 100) }))
                    .sort((a, b) => b.percentage - a.percentage)
                    .slice(0, 6);

                if (!cancelled) { setWeekdayPatterns(wp); setMonthlyTrends(mt); setTopLeaveReasons(tr); }
            } catch (e) {
                if (!cancelled) { setLoadError(e instanceof Error ? e.message : 'Failed to load'); setWeekdayPatterns([]); setMonthlyTrends([]); setTopLeaveReasons([]); }
            } finally { if (!cancelled) setIsLoading(false); }
        })();
        return () => { cancelled = true; };
    }, []);

    const insights = [
        { type: 'warning', title: 'High Friday Leave Requests', description: 'Friday has 2.8x more leave requests than midweek average. Consider reviewing extended weekend policies.' },
        { type: 'info', title: 'December Spike', description: 'December showed 50% higher leave utilization due to holidays. Plan capacity accordingly.' },
        { type: 'success', title: 'Improved Approval Time', description: 'Average approval time reduced from 2.3 days to 1.5 days over the last quarter.' }
    ];

    const maxRequests = weekdayPatterns.length ? Math.max(...weekdayPatterns.map(p => p.requests), 1) : 1;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3">
            <div className="w-full space-y-3">
                {isLoading && (<div className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-300">Loading…</div>)}
                {loadError && !isLoading && (<div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{loadError}</div>)}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <LineChart className="w-8 h-8 text-cyan-500" />
                            Leave Analytics
                        </h1>
                        <p className="text-gray-400 mt-1">Advanced insights and patterns</p>
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                            <option value="month">This Month</option>
                            <option value="quarter">This Quarter</option>
                            <option value="year">This Year</option>
                        </select>
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    {metrics.map((metric) => (
                        <div key={metric.label} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
                            <p className="text-gray-400 text-sm">{metric.label}</p>
                            <div className="flex items-end justify-between mt-2">
                                <p className="text-3xl font-bold text-white">{metric.value}</p>
                                <div className={`flex items-center gap-1 ${metric.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                                    {metric.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                    <span className="text-sm">{Math.abs(metric.change)}%</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-gray-400" />
                            Leave Requests by Day of Week
                        </h3>
                        <div className="space-y-3">
                            {weekdayPatterns.map((pattern) => (
                                <div key={pattern.day} className="flex items-center gap-3">
                                    <span className="w-24 text-sm text-gray-400">{pattern.day}</span>
                                    <div className="flex-1 h-8 bg-gray-700 rounded overflow-hidden relative">
                                        <div
                                            className={`h-full ${pattern.requests > 100 ? 'bg-orange-500' : 'bg-cyan-500'} rounded`}
                                            style={{ width: `${(pattern.requests / maxRequests) * 100}%` }}
                                        ></div>
                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-white">
                                            {pattern.requests}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-4">* Orange indicates above-average request volume</p>
                    </div>

                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-gray-400" />
                            Top Leave Reasons
                        </h3>
                        <div className="space-y-3">
                            {topLeaveReasons.map((reason) => (
                                <div key={reason.reason}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-300">{reason.reason}</span>
                                        <span className="text-white font-medium">{reason.percentage}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                                            style={{ width: `${reason.percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-gray-400" />
                        Monthly Trend
                    </h3>
                    <div className="flex items-end justify-between h-40 gap-2">
                        {monthlyTrends.map((month) => {
                            const maxValue = Math.max(...monthlyTrends.map(m => m.value), 1);
                            const height = (month.value / maxValue) * 100;
                            return (
                                <div key={month.month} className="flex-1 flex flex-col items-center">
                                    <div className="w-full flex flex-col items-center justify-end h-32">
                                        <span className="text-xs text-gray-400 mb-1">{month.value}</span>
                                        <div
                                            className="w-full bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t"
                                            style={{ height: `${height}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-xs text-gray-500 mt-2">{month.month}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-gray-400" />
                        Key Insights
                    </h3>
                    <div className="space-y-3">
                        {insights.map((insight, index) => (
                            <div
                                key={index}
                                className={`p-4 rounded-lg border ${
                                    insight.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/30' :
                                    insight.type === 'success' ? 'bg-green-500/10 border-green-500/30' :
                                    'bg-blue-500/10 border-blue-500/30'
                                }`}
                            >
                                <p className={`font-medium ${
                                    insight.type === 'warning' ? 'text-yellow-400' :
                                    insight.type === 'success' ? 'text-green-400' :
                                    'text-blue-400'
                                }`}>
                                    {insight.title}
                                </p>
                                <p className="text-sm text-gray-400 mt-1">{insight.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
