'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ReportDetailPage } from '@/components/reports/ReportDetailPage';
import { ClickableTableRow } from '@/components/reports/ClickableTableRow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchDomainList } from '@/services/reports-data.service';

function ProjectStatusContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const status = searchParams.get('status') || 'All';

    const [projects, setProjects] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const raw = await fetchDomainList<any>('project-management/progress');
                const mapped = raw.map((r: any) => ({
                    id: r.projectCode ?? r.id,
                    name: r.projectName ?? '',
                    budget: Number(r.budget ?? 0),
                    actual: Number(r.actualCost ?? 0),
                    progress: Number(r.progressPercent ?? r.progress ?? 0),
                    schedule: r.scheduleStatus ?? '',
                    status: r.status ?? '',
                    manager: r.projectManager ?? r.manager ?? '',
                }));
                if (!cancelled) setProjects(mapped);
            } catch (e) {
                if (!cancelled) {
                    setLoadError(e instanceof Error ? e.message : 'Failed to load');
                    setProjects([]);
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const filteredProjects = status === 'All'
        ? projects
        : projects.filter(p => p.status === status);

    return (
        <ReportDetailPage
            title={`Projects: ${status}`}
            description={`List of projects with status: ${status}`}
            breadcrumbs={[
                { label: 'Reports', href: '/reports' },
                { label: 'Project Management', href: '/reports' },
                { label: 'Performance', href: '/reports/project-management/performance' },
                { label: status }
            ]}
        >
            <>
            {isLoading && <div className="mb-3 rounded border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">Loading…</div>}
            {loadError && !isLoading && <div className="mb-3 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{loadError}</div>}
            <Card>
                <CardHeader>
                    <CardTitle>Project List</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project Name</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manager</th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredProjects.map((project) => (
                                <ClickableTableRow
                                    key={project.id}
                                    onClick={() => router.push(`/project-management/projects/${project.id}`)}
                                >
                                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-blue-600">{project.name}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{project.manager}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-900">${(project.budget / 1000).toFixed(0)}K</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                                <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${project.progress}%` }} />
                                            </div>
                                            <span className="text-xs font-medium">{project.progress}%</span>
                                        </div>
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                                        <Badge className={project.status === 'On Track' ? 'bg-green-600' : project.status === 'Over Budget' ? 'bg-red-600' : 'bg-orange-600'}>
                                            {project.status}
                                        </Badge>
                                    </td>
                                </ClickableTableRow>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
            </>
        </ReportDetailPage>
    );
}

export default function ProjectStatusPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ProjectStatusContent />
        </Suspense>
    );
}
