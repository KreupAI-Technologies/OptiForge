'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Users } from 'lucide-react';
import { ClickableKPICard } from '@/components/reports/ClickableKPICard';
import { ClickableTableRow } from '@/components/reports/ClickableTableRow';
import { fetchReportDataset } from '@/services/reports-management.service';

interface ResourceAllocationData {
    totalResources: number;
    allocated: number;
    available: number;
    utilizationRate: number;
    byProject: { id: string; project: string; resources: number; hours: number; utilization: number }[];
}

const DEFAULT_DATA: ResourceAllocationData = {
    totalResources: 85,
    allocated: 72,
    available: 13,
    utilizationRate: 84.7,
    byProject: [
        { id: 'PRJ-001', project: 'Factory Automation Phase 2', resources: 28, hours: 4480, utilization: 92 },
        { id: 'PRJ-002', project: 'ERP System Upgrade', resources: 18, hours: 2880, utilization: 85 },
        { id: 'PRJ-003', project: 'Warehouse Expansion', resources: 16, hours: 2560, utilization: 82 },
        { id: 'PRJ-004', project: 'Quality System ISO Cert', resources: 10, hours: 1600, utilization: 78 },
    ],
};

export default function ResourceAllocationReport() {
    const router = useRouter();
    const [data, setData] = useState<ResourceAllocationData>(DEFAULT_DATA);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const payload = await fetchReportDataset<Partial<ResourceAllocationData>>('project-management.resources');
                if (cancelled) return;
                if (payload) {
                    setData({
                        totalResources: Number(payload.totalResources ?? DEFAULT_DATA.totalResources),
                        allocated: Number(payload.allocated ?? DEFAULT_DATA.allocated),
                        available: Number(payload.available ?? DEFAULT_DATA.available),
                        utilizationRate: Number(payload.utilizationRate ?? DEFAULT_DATA.utilizationRate),
                        byProject: Array.isArray(payload.byProject) ? payload.byProject : DEFAULT_DATA.byProject,
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
                    <h1 className="text-3xl font-bold mb-2">Resource Allocation Report</h1>
                    <p className="text-gray-600">Project resource distribution</p>
                </div>
                <Button variant="outline"><Download className="mr-2 h-4 w-4" />Export</Button>
            </div>

            {isLoading && <p className="text-xs text-gray-400 mb-2">Loading latest figures…</p>}
            {loadError && <p className="text-xs text-amber-600 mb-2">Showing sample data — {loadError}</p>}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                <ClickableKPICard
                    title="Total Resources"
                    value={data.totalResources.toString()}
                    color="blue"
                    onClick={() => router.push('/reports/project-management/resources/role')}
                />
                <ClickableKPICard
                    title="Allocated"
                    value={data.allocated.toString()}
                    color="blue"
                    onClick={() => router.push('/reports/project-management/resources/role?status=Allocated')}
                />
                <ClickableKPICard
                    title="Available"
                    value={data.available.toString()}
                    color="green"
                    onClick={() => router.push('/reports/project-management/resources/role?status=Available')}
                />
                <ClickableKPICard
                    title="Utilization"
                    value={`${data.utilizationRate}%`}
                    color="purple"
                />
            </div>

            <Card>
                <CardHeader><CardTitle>Resource Allocation by Project</CardTitle></CardHeader>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Project</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Resources</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Hours Allocated</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Utilization</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {data.byProject.map((proj) => (
                                <ClickableTableRow
                                    key={proj.id}
                                    onClick={() => router.push(`/project-management/projects/${proj.id}`)}
                                >
                                    <td className="px-4 py-3 text-sm font-medium text-blue-600">{proj.project}</td>
                                    <td className="px-4 py-3 text-center text-sm">{proj.resources}</td>
                                    <td className="px-4 py-3 text-sm text-right">{proj.hours.toLocaleString()} hrs</td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-16 bg-gray-200 rounded-full h-2">
                                                <div className={`h-2 rounded-full ${proj.utilization >= 90 ? 'bg-green-600' : proj.utilization >= 80 ? 'bg-blue-600' : 'bg-orange-600'}`} style={{ width: `${proj.utilization}%` }} />
                                            </div>
                                            <span className="text-sm font-semibold">{proj.utilization}%</span>
                                        </div>
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
