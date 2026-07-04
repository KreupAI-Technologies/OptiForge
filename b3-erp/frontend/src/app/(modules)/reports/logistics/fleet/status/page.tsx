'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ReportDetailPage } from '@/components/reports/ReportDetailPage';
import { ClickableTableRow } from '@/components/reports/ClickableTableRow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchDomainList } from '@/services/reports-data.service';

function FleetStatusContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const status = searchParams.get('status') || 'All';

    const [vehicles, setVehicles] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const raw = await fetchDomainList<any>('logistics/vehicles');
                const mapped = raw.map((r: any) => ({
                    id: r.vehicleCode ?? r.id,
                    vehicle: r.vehicleName ?? r.registrationNumber ?? '',
                    type: r.vehicleType ?? '',
                    utilization: Number(r.utilization ?? 0),
                    mileage: Number(r.mileage ?? r.odometer ?? 0),
                    fuel: Number(r.fuelLevel ?? 0),
                    status: r.status ?? '',
                }));
                if (!cancelled) setVehicles(mapped);
            } catch (e) {
                if (!cancelled) { setLoadError(e instanceof Error ? e.message : 'Failed to load'); setVehicles([]); }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const filteredVehicles = status === 'All'
        ? vehicles
        : vehicles.filter(v => v.status === status);

    return (
        <ReportDetailPage
            title={`Fleet: ${status}`}
            description={`List of vehicles with status: ${status}`}
            breadcrumbs={[
                { label: 'Reports', href: '/reports' },
                { label: 'Logistics', href: '/reports' },
                { label: 'Fleet Utilization', href: '/reports/logistics/fleet' },
                { label: status }
            ]}
        >
            {isLoading && <div className="mb-3 rounded border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">Loading…</div>}
            {loadError && !isLoading && <div className="mb-3 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{loadError}</div>}
            <Card>
                <CardHeader>
                    <CardTitle>Vehicle List</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle ID</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle Name</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Utilization</th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Mileage</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredVehicles.map((vehicle) => (
                                <ClickableTableRow
                                    key={vehicle.id}
                                    onClick={() => router.push(`/logistics/fleet/${vehicle.id}`)}
                                >
                                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-blue-600">{vehicle.id}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{vehicle.vehicle}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{vehicle.type}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-right font-medium">{vehicle.utilization}%</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-500">{vehicle.mileage.toLocaleString()}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${vehicle.status === 'Active' ? 'bg-green-100 text-green-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {vehicle.status}
                                        </span>
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

export default function FleetStatusPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <FleetStatusContent />
        </Suspense>
    );
}
