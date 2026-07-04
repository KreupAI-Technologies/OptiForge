'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ReportDetailPage } from '@/components/reports/ReportDetailPage';
import { ClickableTableRow } from '@/components/reports/ClickableTableRow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchDomainList } from '@/services/reports-data.service';

function ResourceRoleContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const status = searchParams.get('status') || 'All';

    const [resources, setResources] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const raw = await fetchDomainList<any>('project-management/resource-allocations');
                const mapped = raw.map((r: any) => ({
                    id: r.id,
                    name: r.resourceName ?? r.employeeName ?? '',
                    role: r.role ?? r.designation ?? '',
                    project: r.projectName ?? '',
                    hours: Number(r.allocatedHours ?? r.hours ?? 0),
                    utilization: Number(r.utilization ?? 0),
                    status: r.status ?? '',
                }));
                if (!cancelled) setResources(mapped);
            } catch (e) {
                if (!cancelled) {
                    setLoadError(e instanceof Error ? e.message : 'Failed to load');
                    setResources([]);
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const filteredResources = status === 'All'
        ? resources
        : resources.filter(r => r.status === status);

    return (
        <ReportDetailPage
            title={`Resources: ${status}`}
            description={`List of resources with status: ${status}`}
            breadcrumbs={[
                { label: 'Reports', href: '/reports' },
                { label: 'Project Management', href: '/reports' },
                { label: 'Resource Allocation', href: '/reports/project-management/resources' },
                { label: status }
            ]}
        >
            <>
            {isLoading && <div className="mb-3 rounded border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">Loading…</div>}
            {loadError && !isLoading && <div className="mb-3 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{loadError}</div>}
            <Card>
                <CardHeader>
                    <CardTitle>Resource List</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Project</th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Utilization</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredResources.map((resource) => (
                                <ClickableTableRow
                                    key={resource.id}
                                    onClick={() => router.push(`/hr/employees/view/${resource.id}`)}
                                >
                                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-blue-600">{resource.name}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{resource.role}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{resource.project}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-500">{resource.hours}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                                <div className={`h-1.5 rounded-full ${resource.utilization >= 90 ? 'bg-red-500' : resource.utilization >= 75 ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${resource.utilization}%` }} />
                                            </div>
                                            <span className="text-xs font-medium">{resource.utilization}%</span>
                                        </div>
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                                        <Badge variant={resource.status === 'Allocated' ? 'default' : 'secondary'}>
                                            {resource.status}
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

export default function ResourceRolePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResourceRoleContent />
        </Suspense>
    );
}
