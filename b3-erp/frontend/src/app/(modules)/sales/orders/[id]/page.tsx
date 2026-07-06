'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Mail, Printer, Truck, CheckCircle } from 'lucide-react';
import { salesOrderService } from '@/services/sales-order.service';

interface OrderLine {
    description: string;
    quantity: number;
    rate: number;
    amount: number;
}

interface OrderView {
    number: string;
    date: string;
    customerName: string;
    customerAddress: string;
    customerContact: string;
    items: OrderLine[];
    subtotal: number;
    tax: number;
    total: number;
    status: string;
    paymentStatus: string;
    deliveryStatus: string;
    expectedDelivery: string;
    customerEmail?: string;
}

export default function SalesOrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = params.id as string;

    const [order, setOrder] = useState<OrderView | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                setLoading(true);
                // Loosely typed: backend orders-v2/:id returns a Prisma SalesOrder
                const raw = (await salesOrderService.getOrderById(orderId)) as unknown as Record<string, any>;
                const rawItems: any[] = Array.isArray(raw.items) ? raw.items : [];
                const items: OrderLine[] = rawItems.map((it) => ({
                    description: it.itemName || it.productName || it.description || 'Item',
                    quantity: Number(it.quantity ?? 0),
                    rate: Number(it.unitPrice ?? 0),
                    amount: Number(it.lineTotal ?? it.totalPrice ?? (Number(it.quantity ?? 0) * Number(it.unitPrice ?? 0))),
                }));
                const view: OrderView = {
                    number: raw.orderNumber || orderId,
                    date: raw.orderDate ? String(raw.orderDate).split('T')[0] : '-',
                    customerName: raw.customerName || 'Customer',
                    customerAddress: typeof raw.shippingAddress === 'string'
                        ? raw.shippingAddress
                        : (raw.shippingAddress?.line1 || raw.shippingAddress?.address || ''),
                    customerContact: raw.customerPhone || raw.customerEmail || '',
                    items,
                    subtotal: Number(raw.subtotal ?? 0),
                    tax: Number(raw.taxAmount ?? 0),
                    total: Number(raw.totalAmount ?? 0),
                    status: raw.status || 'draft',
                    paymentStatus: raw.paymentStatus || 'pending',
                    deliveryStatus: raw.deliveredAt ? 'Delivered' : raw.shippedAt ? 'In Transit' : 'Pending',
                    expectedDelivery: raw.promisedDeliveryDate || raw.requestedDeliveryDate
                        ? String(raw.promisedDeliveryDate || raw.requestedDeliveryDate).split('T')[0]
                        : '-',
                    customerEmail: raw.customerEmail,
                };
                if (active) setOrder(view);
            } catch (err) {
                if (active) setError(err instanceof Error ? err.message : 'Failed to load order');
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => { active = false; };
    }, [orderId]);

    const money = (n: number) => `₹${(n ?? 0).toLocaleString()}`;

    if (loading) {
        return <div className="w-full px-4 py-6 text-gray-600">Loading order…</div>;
    }
    if (error || !order) {
        return (
            <div className="w-full px-4 py-6">
                <Button variant="ghost" onClick={() => router.back()} className="mb-3">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <p className="text-red-600">{error || 'Order not found.'}</p>
            </div>
        );
    }

    return (
        <div className="w-full px-4 py-2">
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
                        <h1 className="text-3xl font-bold">Sales Order {order.number}</h1>
                        <Badge className="bg-blue-600">{order.status}</Badge>
                    </div>
                    <p className="text-gray-600 mt-1">
                        Customer: {order.customerName} | Date: {order.date}
                    </p>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => window.print()}>
                        <Printer className="mr-2 h-4 w-4" />
                        Print
                    </Button>
                    <Button variant="outline" onClick={() => { if (order.customerEmail) window.location.href = `mailto:${order.customerEmail}`; }}>
                        <Mail className="mr-2 h-4 w-4" />
                        Email
                    </Button>
                    <Button onClick={() => router.push('/sales/orders/tracking')}>
                        <Truck className="mr-2 h-4 w-4" />
                        Track Shipment
                    </Button>
                </div>
            </div>

            {/* Order Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {/* Main Order Details */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {/* Customer Info */}
                            <div className="mb-3 pb-6 border-b">
                                <h3 className="font-semibold mb-2">Customer Information:</h3>
                                <p className="font-medium">{order.customerName}</p>
                                {order.customerAddress && <p className="text-sm text-gray-600">{order.customerAddress}</p>}
                                {order.customerContact && <p className="text-sm text-gray-600">Contact: {order.customerContact}</p>}
                            </div>

                            {/* Line Items */}
                            <table className="w-full mb-3">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Description</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Qty</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Rate</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {order.items.map((item, idx) => (
                                        <tr key={idx}>
                                            <td className="px-4 py-3 text-sm">{item.description}</td>
                                            <td className="px-4 py-3 text-center text-sm">{item.quantity}</td>
                                            <td className="px-4 py-3 text-right text-sm">{money(item.rate)}</td>
                                            <td className="px-4 py-3 text-right text-sm font-semibold">{money(item.amount)}</td>
                                        </tr>
                                    ))}
                                    {order.items.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-400">No line items</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            {/* Totals */}
                            <div className="flex justify-end">
                                <div className="w-64">
                                    <div className="flex justify-between py-2">
                                        <span className="text-gray-600">Subtotal:</span>
                                        <span className="font-semibold">{money(order.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between py-2">
                                        <span className="text-gray-600">Tax:</span>
                                        <span className="font-semibold">{money(order.tax)}</span>
                                    </div>
                                    <div className="flex justify-between py-3 border-t-2 border-gray-300">
                                        <span className="text-lg font-bold">Total:</span>
                                        <span className="text-lg font-bold text-blue-600">{money(order.total)}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-3">
                    {/* Status Cards */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Fulfillment Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2 mb-2">
                                <Truck className="h-5 w-5 text-orange-600" />
                                <span className="font-semibold text-orange-600">{order.deliveryStatus}</span>
                            </div>
                            <div className="text-sm text-gray-600">
                                Expected Delivery: <span className="font-medium text-gray-900">{order.expectedDelivery}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircle className="h-5 w-5 text-yellow-600" />
                                <span className="font-semibold text-yellow-600">{order.paymentStatus}</span>
                            </div>
                            <Button variant="outline" className="w-full text-sm" onClick={() => router.push('/sales/invoices')}>View Invoices</Button>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button className="w-full" variant="outline" onClick={() => router.push('/sales/invoices/create')}>
                                Create Invoice
                            </Button>
                            <Button className="w-full" variant="outline" onClick={() => router.push('/sales/delivery')}>
                                Create Delivery Note
                            </Button>
                            <Button className="w-full" variant="outline" onClick={() => router.push('/sales/orders')}>
                                Cancel Order
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
