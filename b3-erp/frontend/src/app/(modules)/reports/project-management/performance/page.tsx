'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Briefcase, Target, Users, TrendingUp } from 'lucide-react';
import { ClickableKPICard } from '@/components/reports/ClickableKPICard';
import { ClickableTableRow } from '@/components/reports/ClickableTableRow';
import { fetchReportDataset } from '@/services/reports-management.service';

interface ProjectPerformanceData {
    totalProjects: number;
    activeProjects: number;
    onBudget: number;
    onSchedule: number;
    byStatus: { status: string; count: number }[];
    projects: { id: string; name: string; budget: number; actual: number; progress: number; schedule: number; status: string }[];
}

const DEFAULT_DATA: ProjectPerformanceData = {
    totalProjects: 18,
    activeProjects: 12,
    onBudget: 75,
    onSchedule: 67,
    byStatus: [
        { status: 'Planning', count: 3 },
        { status: 'In Progress', count: 12 },
        { status: 'On Hold', count: 2 },
        { status: 'Completed', count: 1 },
    ],
    projects: [
        { id: 'PRJ-001', name: 'Factory Automation Phase 2', budget: 2500000, actual: 2100000, progress: 85, schedule: 92, status: 'On Track' },
        { id: 'PRJ-002', name: 'ERP System Upgrade', budget: 850000, actual: 920000, progress: 95, schedule: 98, status: 'Over Budget' },
        { id: 'PRJ-003', name: 'Warehouse Expansion', budget: 1200000, actual: 1050000, progress: 88, schedule: 85, status: 'Delayed' },
        { id: 'PRJ-004', name: 'Quality System ISO Cert', budget: 320000, actual: 280000, progress: 75, schedule: 78, status: 'On Track' },
    ],
};

export default function ProjectPerformanceReport() {
    const router = useRouter();
    const [period, setPeriod] = useState('all-active');

    const [data, setData] = useState<ProjectPerformanceData>(DEFAULT_DATA);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const payload = await fetchReportDataset<Partial<ProjectPerformanceData>>('project-management.performance');
                if (cancelled) return;
                if (payload) {
                    setData({
                        totalProjects: Number(payload.totalProjects ?? DEFAULT_DATA.totalProjects),
                        activeProjects: Number(payload.activeProjects ?? DEFAULT_DATA.activeProjects),
                        onBudget: Number(payload.onBudget ?? DEFAULT_DATA.onBudget),
                        onSchedule: Number(payload.onSchedule ?? DEFAULT_DATA.onSchedule),
                        byStatus: Array.isArray(payload.byStatus) ? payload.byStatus : DEFAULT_DATA.byStatus,
                        projects: Array.isArray(payload.projects) ? payload.projects : DEFAULT_DATA.projects,
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
                    <h1 className="text-3xl font-bold mb-2">Project Performance Report</h1>
                    <p className="text-gray-600">Project tracking and performance metrics</p>
                </div>
                <div className="flex gap-2">
                    <select value={period} onChange={(e) => setPeriod(e.target.value)} className="px-4 py-2 border rounded-lg">
                        <option value="all-active">All Active</option>
                        <option value="this-quarter">This Quarter</option>
                    </select>
                    <Button variant="outline"><Download className="mr-2 h-4 w-4" />Export</Button>
                </div>
            </div>

            {isLoading && <p className="text-xs text-gray-400 mb-2">Loading latest figures…</p>}
            {loadError && <p className="text-xs text-amber-600 mb-2">Showing sample data — {loadError}</p>}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                <ClickableKPICard
                    title="Total Projects"
                    value={data.totalProjects.toString()}
                    color="blue"
                    description={`${data.activeProjects} active`}
                    onClick={() => router.push('/reports/project-management/performance/status?status=All')}
                />
                <ClickableKPICard
                    title="On Budget"
                    value={`${data.onBudget}%`}
                    color="green"
                    onClick={() => router.push('/reports/project-management/performance/status?status=On Track')}
                />
                <ClickableKPICard
                    title="On Schedule"
                    value={`${data.onSchedule}%`}
                    color="purple"
                    onClick={() => router.push('/reports/project-management/performance/status?status=On Track')}
                />
                <ClickableKPICard
                    title="Team Members"
                    value="85"
                    color="orange"
                    description="Across all projects"
                    onClick={() => router.push('/reports/project-management/resources/role')}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-3">
                <Card>
                    <CardHeader><CardTitle>Projects by Status</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {data.byStatus.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-1 rounded" onClick={() => router.push(`/reports/project-management/performance/status?status=${item.status}`)}>
                                    <span className="font-medium">{item.status}</span>
                                    <div className="flex items-center gap-3">
                                        <div className="w-24 bg-gray-200 rounded-full h-2">
                                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(item.count / data.totalProjects) * 100}%` }} />
                                        </div>
                                        <span className="font-semibold w-8 text-right">{item.count}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader><CardTitle>Project Details</CardTitle></CardHeader>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Project</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Budget vs Actual</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Progress</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Schedule</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {data.projects.map((proj) => (
                                <ClickableTableRow
                                    key={proj.id}
                                    onClick={() => router.push(`/project-management/projects/${proj.id}`)}
                                >
                                    <td className="px-4 py-3 text-sm font-medium text-blue-600">{proj.name}</td>
                                    <td className="px-4 py-3 text-sm text-right">
                                        <div>${(proj.budget / 1000).toFixed(0)}K / ${(proj.actual / 1000).toFixed(0)}K</div>
                                        <div className={`text-xs ${proj.actual > proj.budget ? 'text-red-600' : 'text-green-600'}`}>
                                            {proj.actual > proj.budget ? '+' : ''}{((proj.actual - proj.budget) / 1000).toFixed(0)}K
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-16 bg-gray-200 rounded-full h-2">
                                                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${proj.progress}%` }} />
                                            </div>
                                            <span className="text-sm font-semibold">{proj.progress}%</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`font-semibold ${proj.schedule >= 95 ? 'text-green-600' : proj.schedule >= 85 ? 'text-orange-600' : 'text-red-600'}`}>
                                            {proj.schedule}%
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <Badge className={proj.status === 'On Track' ? 'bg-green-600' : proj.status === 'Over Budget' ? 'bg-red-600' : 'bg-orange-600'}>
                                            {proj.status}
                                        </Badge>
                                    </td>
                                </ClickableTableRow>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}
