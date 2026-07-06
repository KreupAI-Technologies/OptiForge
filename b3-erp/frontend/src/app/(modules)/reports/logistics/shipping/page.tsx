'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Truck, CheckCircle, Clock, Package } from 'lucide-react';
import { ClickableKPICard } from '@/components/reports/ClickableKPICard';
import { ClickableTableRow } from '@/components/reports/ClickableTableRow';
import { fetchReportDataset } from '@/services/reports-management.service';

interface ShippingData {
    totalShipments: number;
    onTimeDelivery: number;
    avgTransitTime: number;
    shippingCost: number;
    byStatus: { status: string; count: number }[];
    byCarrier: { id: string; carrier: string; shipments: number; onTime: number; avgCost: number }[];
}

const DEFAULT_DATA: ShippingData = {
    totalShipments: 342,
    onTimeDelivery: 89.5,
    avgTransitTime: 3.2,
    shippingCost: 125000,
    byStatus: [
        { status: 'In Transit', count: 45 },
        { status: 'Delivered', count: 278 },
        { status: 'Delayed', count: 12 },
        { status: 'Cancelled', count: 7 },
    ],
    byCarrier: [
        { id: 'CAR-001', carrier: 'Express Logistics', shipments: 142, onTime: 92, avgCost: 380 },
        { id: 'CAR-002', carrier: 'Fast Freight', shipments: 98, onTime: 88, avgCost: 320 },
        { id: 'CAR-003', carrier: 'Economy Transport', shipments: 72, onTime: 85, avgCost: 280 },
        { id: 'CAR-004', carrier: 'Premium Courier', shipments: 30, onTime: 95, avgCost: 520 },
    ],
};

export default function ShippingPerformanceReport() {
    const router = useRouter();
    const [period, setPeriod] = useState('this-month');
    const [data, setData] = useState<ShippingData>(DEFAULT_DATA);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const payload = await fetchReportDataset<Partial<ShippingData>>('logistics.shipping');
                if (cancelled) return;
                if (payload) {
                    setData({
                        totalShipments: Number(payload.totalShipments ?? DEFAULT_DATA.totalShipments),
                        onTimeDelivery: Number(payload.onTimeDelivery ?? DEFAULT_DATA.onTimeDelivery),
                        avgTransitTime: Number(payload.avgTransitTime ?? DEFAULT_DATA.avgTransitTime),
                        shippingCost: Number(payload.shippingCost ?? DEFAULT_DATA.shippingCost),
                        byStatus: Array.isArray(payload.byStatus) ? payload.byStatus : DEFAULT_DATA.byStatus,
                        byCarrier: Array.isArray(payload.byCarrier) ? payload.byCarrier : DEFAULT_DATA.byCarrier,
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
                    <h1 className="text-3xl font-bold mb-2">Shipping Performance Report</h1>
                    <p className="text-gray-600">Delivery tracking and carrier analysis</p>
                </div>
                <div className="flex gap-2">
                    <select value={period} onChange={(e) => setPeriod(e.target.value)} className="px-4 py-2 border rounded-lg">
                        <option value="this-month">This Month</option>
                        <option value="this-quarter">This Quarter</option>
                    </select>
                    <Button variant="outline"><Download className="mr-2 h-4 w-4" />Export</Button>
                </div>
            </div>

            {isLoading && <p className="text-xs text-gray-400 mb-2">Loading latest figures…</p>}
            {loadError && <p className="text-xs text-amber-600 mb-2">Showing sample data — {loadError}</p>}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                <ClickableKPICard
                    title="Total Shipments"
                    value={data.totalShipments.toString()}
                    color="blue"
                    onClick={() => router.push('/reports/logistics/shipping/carrier')}
                />
                <ClickableKPICard
                    title="On-Time Delivery"
                    value={`${data.onTimeDelivery}%`}
                    color={data.onTimeDelivery >= 90 ? 'green' : 'orange'}
                />
                <ClickableKPICard
                    title="Avg Transit Time"
                    value={data.avgTransitTime.toString()}
                    color="orange"
                    description="Days"
                />
                <ClickableKPICard
                    title="Shipping Cost"
                    value={`$${(data.shippingCost / 1000).toFixed(0)}K`}
                    color="purple"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
                <Card>
                    <CardHeader><CardTitle>Shipments by Status</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {data.byStatus.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between">
                                    <span className="font-medium">{item.status}</span>
                                    <div className="flex items-center gap-3">
                                        <div className="w-32 bg-gray-200 rounded-full h-2">
                                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(item.count / data.totalShipments) * 100}%` }} />
                                        </div>
                                        <span className="font-semibold w-12 text-right">{item.count}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Carrier Performance</CardTitle></CardHeader>
                    <CardContent className="p-0">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Carrier</th>
                                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Shipments</th>
                                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">On-Time %</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {data.byCarrier.map((carrier) => (
                                    <ClickableTableRow
                                        key={carrier.id}
                                        onClick={() => router.push(`/reports/logistics/shipping/carrier?id=${carrier.id}`)}
                                    >
                                        <td className="px-4 py-2 text-sm font-medium text-blue-600">{carrier.carrier}</td>
                                        <td className="px-4 py-2 text-center"><Badge variant="outline">{carrier.shipments}</Badge></td>
                                        <td className="px-4 py-2 text-center"><span className={`font-semibold ${carrier.onTime >= 90 ? 'text-green-600' : 'text-orange-600'}`}>{carrier.onTime}%</span></td>
                                    </ClickableTableRow>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
