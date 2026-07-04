'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ReportDetailPage } from '@/components/reports/ReportDetailPage';
import { ClickableTableRow } from '@/components/reports/ClickableTableRow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchDomainList } from '@/services/reports-data.service';

function ShippingCarrierContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const carrierId = searchParams.get('id');
    const title = carrierId ? `Carrier: ${carrierId}` : 'Carrier Performance';

    const [shipments, setShipments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const raw = await fetchDomainList<any>('logistics/shipments');
                const mapped = raw.map((r: any) => ({
                    id: r.shipmentNumber ?? r.trackingNumber ?? r.id,
                    date: r.shipmentDate ?? r.dispatchDate ?? '',
                    destination: r.destination ?? r.deliveryAddress ?? '',
                    weight: Number(r.weight ?? r.totalWeight ?? 0),
                    cost: Number(r.freightCost ?? r.cost ?? 0),
                    status: r.status ?? '',
                }));
                if (!cancelled) setShipments(mapped);
            } catch (e) {
                if (!cancelled) { setLoadError(e instanceof Error ? e.message : 'Failed to load'); setShipments([]); }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    return (
        <ReportDetailPage
            title={title}
            description="Detailed shipment history by carrier"
            breadcrumbs={[
                { label: 'Reports', href: '/reports' },
                { label: 'Logistics', href: '/reports' },
                { label: 'Shipping', href: '/reports/logistics/shipping' },
                { label: 'Carrier' }
            ]}
        >
            {isLoading && <div className="mb-3 rounded border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">Loading…</div>}
            {loadError && !isLoading && <div className="mb-3 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{loadError}</div>}
            <Card>
                <CardHeader>
                    <CardTitle>Shipment History</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shipment ID</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Weight</th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {shipments.map((shipment) => (
                                <ClickableTableRow
                                    key={shipment.id}
                                    onClick={() => router.push(`/logistics/shipments/${shipment.id}`)}
                                >
                                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-blue-600">{shipment.id}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{shipment.date}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{shipment.destination}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-500">{shipment.weight}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-right font-medium">${shipment.cost}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${shipment.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                                shipment.status === 'In Transit' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-red-100 text-red-800'
                                            }`}>
                                            {shipment.status}
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

export default function ShippingCarrierPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ShippingCarrierContent />
        </Suspense>
    );
}
