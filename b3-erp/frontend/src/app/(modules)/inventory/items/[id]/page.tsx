'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { inventoryService } from '@/services/InventoryService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Package, BarChart3, History, Layers } from 'lucide-react';

export default function ItemDetailPage() {
    const router = useRouter();
    const id = useParams().id as string;

    const [item, setItem] = useState<any | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        let active = true;
        (async () => {
            setLoading(true);
            try {
                const data = await inventoryService.getStockBalance(id);
                if (active) setItem(data ?? null);
            } catch (err) {
                console.error('Failed to load stock balance', err);
                if (active) setItem(null);
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => {
            active = false;
        };
    }, [id]);

    if (loading) {
        return (
            <div className="w-full p-3">
                <div className="text-center py-16 text-gray-500">Loading item…</div>
            </div>
        );
    }

    if (!item) {
        return (
            <div className="w-full p-3">
                <Button variant="ghost" onClick={() => router.back()} className="mb-2">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                <div className="text-center py-16">
                    <Package className="w-12 h-12 text-gray-400 mb-2 mx-auto" />
                    <p className="text-gray-500">Item not found</p>
                </div>
            </div>
        );
    }

    const availableQuantity = item?.availableQuantity ?? 0;
    const reservedQuantity = item?.reservedQuantity ?? 0;
    const freeQuantity = item?.freeQuantity ?? availableQuantity;
    const valuationRate = item?.valuationRate ?? 0;
    const stockValue = item?.stockValue ?? 0;
    const uom = item?.uom ?? '';

    const specifications: { label: string; value: string }[] = [
        { label: 'Available', value: `${availableQuantity} ${uom}`.trim() },
        { label: 'Reserved', value: `${reservedQuantity} ${uom}`.trim() },
        { label: 'Free', value: `${freeQuantity} ${uom}`.trim() },
        { label: 'Safety Stock', value: `${item?.safetyStock ?? '—'}` },
    ];

    return (
        <div className="w-full p-3">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div>
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="mb-2"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold">{item?.itemName ?? 'Item'}</h1>
                        <Badge className="bg-green-600">{item?.belowReorderLevel ? 'Low Stock' : 'Active'}</Badge>
                    </div>
                    <p className="text-gray-600 mt-1">
                        Code: {item?.itemCode ?? '—'} | Category: {item?.itemCategory ?? '—'}
                    </p>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline">
                        <History className="mr-2 h-4 w-4" />
                        Movement History
                    </Button>
                    <Button variant="outline">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Stock Analysis
                    </Button>
                </div>
            </div>

            {/* Item Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {/* Main Details */}
                <div className="lg:col-span-2">
                    <Card className="mb-3">
                        <CardHeader>
                            <CardTitle>Item Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <div>
                                    <p className="text-sm text-gray-500">Warehouse</p>
                                    <p className="font-medium">{item?.warehouseName ?? '—'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Unit of Measure</p>
                                    <p className="font-medium">{uom || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Default Location</p>
                                    <p className="font-medium">{item?.locationName ?? '—'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Reorder Level</p>
                                    <p className="font-medium text-orange-600">{item?.reorderLevel ?? 0} {uom}</p>
                                </div>
                            </div>

                            <h3 className="font-semibold mb-3">Specifications</h3>
                            <div className="bg-gray-50 rounded-lg p-3">
                                <div className="grid grid-cols-2 gap-2">
                                    {specifications.map((spec, idx) => (
                                        <div key={idx}>
                                            <p className="text-sm text-gray-500">{spec.label}</p>
                                            <p className="font-medium">{spec.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Transactions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Type</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Reference</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Qty</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    <tr>
                                        <td className="px-4 py-3 text-sm">2025-01-20</td>
                                        <td className="px-4 py-3 text-sm">Issue</td>
                                        <td className="px-4 py-3 text-sm text-blue-600">WO-2025-001</td>
                                        <td className="px-4 py-3 text-sm text-right text-red-600">-25</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-3 text-sm">2025-01-15</td>
                                        <td className="px-4 py-3 text-sm">Receipt</td>
                                        <td className="px-4 py-3 text-sm text-blue-600">GRN-2025-089</td>
                                        <td className="px-4 py-3 text-sm text-right text-green-600">+100</td>
                                    </tr>
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Stock Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-4">
                                <Package className="w-12 h-12 text-blue-600 mb-2" />
                                <p className="text-3xl font-bold text-gray-900">{availableQuantity}</p>
                                <p className="text-sm text-gray-500">{uom} Available</p>
                            </div>
                            <div className="border-t pt-4 mt-4">
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-600">Valuation Rate</span>
                                    <span className="font-medium">₹{Number(valuationRate).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Total Value</span>
                                    <span className="font-bold text-green-600">₹{Number(stockValue).toLocaleString()}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button className="w-full" variant="outline">
                                Adjust Stock
                            </Button>
                            <Button className="w-full" variant="outline">
                                Request Purchase
                            </Button>
                            <Button className="w-full" variant="outline">
                                Print Label
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
