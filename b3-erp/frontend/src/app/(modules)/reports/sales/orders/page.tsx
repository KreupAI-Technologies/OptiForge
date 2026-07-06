'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, CheckCircle, Clock, Truck } from 'lucide-react';
import { ClickableKPICard } from '@/components/reports/ClickableKPICard';
import { fetchReportDataset } from '@/services/reports-management.service';

interface OrderFulfillmentData {
    totalOrders: number;
    pendingOrders: number;
    shippedOrders: number;
    deliveredOrders: number;
    onTimeDelivery: number;
}

const DEFAULT_DATA: OrderFulfillmentData = {
    totalOrders: 145,
    pendingOrders: 25,
    shippedOrders: 45,
    deliveredOrders: 75,
    onTimeDelivery: 92,
};

export default function OrderFulfillmentReport() {
    const router = useRouter();

    const [data, setData] = useState<OrderFulfillmentData>(DEFAULT_DATA);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const payload = await fetchReportDataset<Partial<OrderFulfillmentData>>('sales.orders');
                if (cancelled) return;
                if (payload) {
                    setData({
                        totalOrders: Number(payload.totalOrders ?? DEFAULT_DATA.totalOrders),
                        pendingOrders: Number(payload.pendingOrders ?? DEFAULT_DATA.pendingOrders),
                        shippedOrders: Number(payload.shippedOrders ?? DEFAULT_DATA.shippedOrders),
                        deliveredOrders: Number(payload.deliveredOrders ?? DEFAULT_DATA.deliveredOrders),
                        onTimeDelivery: Number(payload.onTimeDelivery ?? DEFAULT_DATA.onTimeDelivery),
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
                    <h1 className="text-3xl font-bold mb-2">Order Fulfillment</h1>
                    <p className="text-gray-600">Track order status and delivery performance</p>
                </div>
                <Button variant="outline"><Download className="mr-2 h-4 w-4" />Export</Button>
            </div>

            {isLoading && <p className="text-xs text-gray-400 mb-2">Loading latest figures…</p>}
            {loadError && <p className="text-xs text-amber-600 mb-2">Showing sample data — {loadError}</p>}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                <ClickableKPICard
                    title="Total Orders"
                    value={data.totalOrders.toString()}
                    color="blue"
                    onClick={() => router.push('/reports/sales/orders/status?status=All')}
                />
                <ClickableKPICard
                    title="Pending"
                    value={data.pendingOrders.toString()}
                    color="orange"
                    onClick={() => router.push('/reports/sales/orders/status?status=Pending')}
                />
                <ClickableKPICard
                    title="Shipped"
                    value={data.shippedOrders.toString()}
                    color="purple"
                    onClick={() => router.push('/reports/sales/orders/status?status=Shipped')}
                />
                <ClickableKPICard
                    title="Delivered"
                    value={data.deliveredOrders.toString()}
                    color="green"
                    onClick={() => router.push('/reports/sales/orders/status?status=Delivered')}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/reports/sales/orders/status?status=Pending')}>
                    <CardHeader><CardTitle>Pending Orders Analysis</CardTitle></CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center h-40 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                            <div className="text-center">
                                <Clock className="w-8 h-8 text-orange-400 mb-2" />
                                <p className="text-gray-500">Click to view 25 pending orders</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/reports/sales/orders/status?status=Shipped')}>
                    <CardHeader><CardTitle>Shipment Tracking</CardTitle></CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center h-40 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                            <div className="text-center">
                                <Truck className="w-8 h-8 text-purple-400 mb-2" />
                                <p className="text-gray-500">Click to track 45 active shipments</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
