'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Truck, Users, DollarSign } from 'lucide-react';
import { ClickableKPICard } from '@/components/reports/ClickableKPICard';
import { ClickableTableRow } from '@/components/reports/ClickableTableRow';
import { fetchReportDataset } from '@/services/reports-management.service';

interface FleetData {
    totalVehicles: number;
    avgUtilization: number;
    totalMileage: number;
    maintenanceCost: number;
    vehicles: { id: string; vehicle: string; type: string; utilization: number; mileage: number; fuel: number; status: string }[];
}

const DEFAULT_DATA: FleetData = {
    totalVehicles: 24,
    avgUtilization: 78.5,
    totalMileage: 125000,
    maintenanceCost: 45000,
    vehicles: [
        { id: 'VEH-001', vehicle: 'Truck - TRK-001', type: 'Delivery Truck', utilization: 92, mileage: 8500, fuel: 2100, status: 'Active' },
        { id: 'VEH-002', vehicle: 'Van - VAN-003', type: 'Cargo Van', utilization: 85, mileage: 6200, fuel: 1400, status: 'Active' },
        { id: 'VEH-003', vehicle: 'Truck - TRK-002', type: 'Delivery Truck', utilization: 78, mileage: 7100, fuel: 1850, status: 'Maintenance' },
        { id: 'VEH-004', vehicle: 'Van - VAN-001', type: 'Cargo Van', utilization: 65, mileage: 4800, fuel: 1100, status: 'Active' },
    ],
};

export default function FleetUtilizationReport() {
    const router = useRouter();
    const [data, setData] = useState<FleetData>(DEFAULT_DATA);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const payload = await fetchReportDataset<Partial<FleetData>>('logistics.fleet');
                if (cancelled) return;
                if (payload) {
                    setData({
                        totalVehicles: Number(payload.totalVehicles ?? DEFAULT_DATA.totalVehicles),
                        avgUtilization: Number(payload.avgUtilization ?? DEFAULT_DATA.avgUtilization),
                        totalMileage: Number(payload.totalMileage ?? DEFAULT_DATA.totalMileage),
                        maintenanceCost: Number(payload.maintenanceCost ?? DEFAULT_DATA.maintenanceCost),
                        vehicles: Array.isArray(payload.vehicles) ? payload.vehicles : DEFAULT_DATA.vehicles,
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
                    <h1 className="text-3xl font-bold mb-2">Fleet Utilization Report</h1>
                    <p className="text-gray-600">Vehicle fleet performance tracking</p>
                </div>
                <Button variant="outline"><Download className="mr-2 h-4 w-4" />Export</Button>
            </div>

            {isLoading && <p className="text-xs text-gray-400 mb-2">Loading latest figures…</p>}
            {loadError && <p className="text-xs text-amber-600 mb-2">Showing sample data — {loadError}</p>}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                <ClickableKPICard
                    title="Total Vehicles"
                    value={data.totalVehicles.toString()}
                    color="blue"
                    onClick={() => router.push('/reports/logistics/fleet/status?status=All')}
                />
                <ClickableKPICard
                    title="Avg Utilization"
                    value={`${data.avgUtilization}%`}
                    color={data.avgUtilization >= 75 ? 'green' : 'orange'}
                />
                <ClickableKPICard
                    title="Total Mileage"
                    value={data.totalMileage.toLocaleString()}
                    color="blue"
                />
                <ClickableKPICard
                    title="Maintenance Cost"
                    value={`$${(data.maintenanceCost / 1000).toFixed(0)}K`}
                    color="orange"
                    onClick={() => router.push('/reports/logistics/fleet/status?status=Maintenance')}
                />
            </div>

            <Card>
                <CardHeader><CardTitle>Fleet Performance</CardTitle></CardHeader>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Vehicle</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Type</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Utilization</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Mileage</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Fuel Cost</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {data.vehicles.map((vehicle) => (
                                <ClickableTableRow
                                    key={vehicle.id}
                                    onClick={() => router.push(`/logistics/fleet/${vehicle.id}`)}
                                >
                                    <td className="px-4 py-3 text-sm font-medium text-blue-600">{vehicle.vehicle}</td>
                                    <td className="px-4 py-3 text-sm">{vehicle.type}</td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-16 bg-gray-200 rounded-full h-2">
                                                <div className={`h-2 rounded-full ${vehicle.utilization >= 80 ? 'bg-green-600' : 'bg-orange-600'}`} style={{ width: `${vehicle.utilization}%` }} />
                                            </div>
                                            <span className="text-sm font-semibold">{vehicle.utilization}%</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right">{vehicle.mileage.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-sm text-right font-semibold">${vehicle.fuel}</td>
                                </ClickableTableRow>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}
