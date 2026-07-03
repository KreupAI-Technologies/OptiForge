'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ReportDetailPage } from '@/components/reports/ReportDetailPage';
import { exportToCsv } from '@/lib/export';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClickableTableRow } from '@/components/reports/ClickableTableRow';
import { Badge } from '@/components/ui/badge';

function NCRBySeverityContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const severity = searchParams.get('severity') || 'High';

    const ncrsData = [
        { id: 'NCR-2025-045', title: 'Dimensional Non-Conformance', product: 'Commercial Ovens', raisedBy: 'QC Inspector 1', date: '2025-01-20', status: 'Open', capaRequired: true },
        { id: 'NCR-2025-042', title: 'Surface Finish Issue', product: 'Refrigeration Units', raisedBy: 'QC Inspector 2', date: '2025-01-18', status: 'In Progress', capaRequired: true },
        { id: 'NCR-2025-038', title: 'Material Defect', product: 'Industrial Mixers', raisedBy: 'QC Inspector 1', date: '2025-01-15', status: 'Closed', capaRequired: false },
    ];

    const handleNCRClick = (ncrId: string) => {
        router.push(`/quality/ncr/${ncrId}`);
    };

    const getStatusColor = (status: string) => {
        const colors = {
            'Open': 'bg-red-600',
            'In Progress': 'bg-orange-600',
            'Closed': 'bg-green-600',
        };
        return colors[status as keyof typeof colors] || 'bg-gray-600';
    };

    return (
        <ReportDetailPage
            title={`NCRs - ${severity} Severity`}
            description={`Non-conformance reports with ${severity.toLowerCase()} severity`}
            breadcrumbs={[
                { label: 'Reports', href: '/reports' },
                { label: 'Quality', href: '/reports' },
                { label: 'NCR & CAPA', href: '/reports/quality/ncr-capa' },
                { label: `${severity} Severity` },
            ]}
            onBack={() => router.back()}
            onExport={() => exportToCsv('ncr-capa-severity', ncrsData)}
        >
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-gray-600">Total NCRs</p>
                        <p className="text-2xl font-bold text-red-600">3</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-gray-600">Open</p>
                        <p className="text-2xl font-bold text-orange-600">1</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-gray-600">CAPA Required</p>
                        <p className="text-2xl font-bold text-purple-600">2</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-gray-600">Closure Rate</p>
                        <p className="text-2xl font-bold text-green-600">33%</p>
                    </CardContent>
                </Card>
            </div>

            {/* NCRs Table */}
            <Card>
                <CardHeader>
                    <CardTitle>{severity} Severity NCRs</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">NCR ID</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Title</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Product</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Raised By</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Status</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">CAPA</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {ncrsData.map((ncr) => (
                                <ClickableTableRow
                                    key={ncr.id}
                                    onClick={() => handleNCRClick(ncr.id)}
                                >
                                    <td className="px-4 py-3 text-sm font-medium text-blue-600">{ncr.id}</td>
                                    <td className="px-4 py-3 text-sm font-semibold">{ncr.title}</td>
                                    <td className="px-4 py-3 text-sm">{ncr.product}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{ncr.raisedBy}</td>
                                    <td className="px-4 py-3 text-sm">{ncr.date}</td>
                                    <td className="px-4 py-3 text-center">
                                        <Badge className={getStatusColor(ncr.status)}>
                                            {ncr.status}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {ncr.capaRequired ? (
                                            <Badge className="bg-purple-600">Required</Badge>
                                        ) : (
                                            <Badge variant="outline">Not Required</Badge>
                                        )}
                                    </td>
                                </ClickableTableRow>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </ReportDetailPage>
    );
}

export default function NCRBySeverityDetail() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <NCRBySeverityContent />
        </Suspense>
    );
}
