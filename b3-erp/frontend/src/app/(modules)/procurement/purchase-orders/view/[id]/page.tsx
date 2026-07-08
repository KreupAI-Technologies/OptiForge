'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Printer, Mail, Truck, CheckCircle, XCircle, RotateCcw, AlertCircle } from 'lucide-react';
import { purchaseOrderService, PurchaseOrder } from '@/services/purchase-order.service';

export default function PurchaseOrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = params.id as string;

    const [order, setOrder] = useState<PurchaseOrder | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [busyAction, setBusyAction] = useState<string | null>(null);

    const loadOrder = async () => {
        setLoadError(null);
        try {
            setLoading(true);
            const po = await purchaseOrderService.getPurchaseOrderById(orderId);
            setOrder(po);
        } catch (err) {
            setLoadError(err instanceof Error ? err.message : 'Failed to load purchase order');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (orderId) loadOrder();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderId]);

    const runAction = async (
        name: string,
        fn: () => Promise<PurchaseOrder>,
        successText: string,
    ) => {
        setActionError(null);
        setSuccessMessage(null);
        try {
            setBusyAction(name);
            const updated = await fn();
            setOrder(updated);
            setSuccessMessage(successText);
        } catch (err) {
            setActionError(err instanceof Error ? err.message : `Failed to ${name} purchase order`);
        } finally {
            setBusyAction(null);
        }
    };

    const handleSubmitForApproval = () =>
        runAction('submit', () => purchaseOrderService.submitPurchaseOrder(orderId), 'Purchase order submitted for approval.');

    const handleApprove = () =>
        runAction('approve', () => purchaseOrderService.approvePurchaseOrder(orderId), 'Purchase order approved.');

    const handleClose = () =>
        runAction('close', () => purchaseOrderService.closePurchaseOrder(orderId), 'Purchase order closed.');

    const handleCancel = () => {
        const reason = window.prompt('Reason for cancelling this purchase order (optional):') ?? undefined;
        return runAction('cancel', () => purchaseOrderService.rejectPurchaseOrder(orderId, reason), 'Purchase order cancelled.');
    };

    if (loading) {
        return (
            <div className="w-full p-3">
                <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
                    Loading purchase order…
                </div>
            </div>
        );
    }

    if (loadError || !order) {
        return (
            <div className="w-full p-3">
                <Button variant="ghost" onClick={() => router.back()} className="mb-2">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertCircle className="h-4 w-4" />
                    {loadError ?? 'Purchase order not found.'}
                </div>
            </div>
        );
    }

    const statusColor =
        order.status === 'Cancelled'
            ? 'bg-red-600'
            : order.status === 'Closed' || order.status === 'Fully Received'
                ? 'bg-gray-600'
                : order.status === 'Approved'
                    ? 'bg-green-600'
                    : 'bg-blue-600';

    return (
        <div className="w-full p-3">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div>
                    <Button variant="ghost" onClick={() => router.back()} className="mb-2">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold">Purchase Order {order.poNumber}</h1>
                        <Badge className={statusColor}>{order.status}</Badge>
                    </div>
                    <p className="text-gray-600 mt-1">
                        Vendor: {order.vendorName} | Date: {(order.orderDate || '').split('T')[0]}
                    </p>
                </div>

                <div className="flex gap-2">
                    {order.status === 'Draft' && (
                        <Button
                            onClick={handleSubmitForApproval}
                            disabled={busyAction !== null}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {busyAction === 'submit' ? 'Submitting…' : 'Submit for Approval'}
                        </Button>
                    )}
                    {order.status === 'Pending Approval' && (
                        <Button
                            onClick={handleApprove}
                            disabled={busyAction !== null}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {busyAction === 'approve' ? 'Approving…' : 'Approve'}
                        </Button>
                    )}
                    <Button variant="outline">
                        <Printer className="mr-2 h-4 w-4" />
                        Print
                    </Button>
                    <Button variant="outline">
                        <Mail className="mr-2 h-4 w-4" />
                        Email Vendor
                    </Button>
                    <Button>
                        <Truck className="mr-2 h-4 w-4" />
                        Receive Goods
                    </Button>
                </div>
            </div>

            {actionError && (
                <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <XCircle className="h-4 w-4" />
                    {actionError}
                </div>
            )}
            {successMessage && (
                <div className="mb-3 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    <CheckCircle className="h-4 w-4" />
                    {successMessage}
                </div>
            )}

            {/* Order Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {/* Main Order Details */}
                <div className="lg:col-span-2">
                    <Tabs defaultValue="details">
                        <TabsList className="mb-2">
                            <TabsTrigger value="details">Order Details</TabsTrigger>
                        </TabsList>

                        <TabsContent value="details">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Order Details</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {/* Vendor Info */}
                                    <div className="mb-3 pb-6 border-b">
                                        <h3 className="font-semibold mb-2">Vendor Information:</h3>
                                        <p className="font-medium">{order.vendorName}</p>
                                        {order.vendorAddress && <p className="text-sm text-gray-600">{order.vendorAddress}</p>}
                                        {order.vendorContact && <p className="text-sm text-gray-600">Contact: {order.vendorContact}</p>}
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
                                                <tr key={item.id || idx}>
                                                    <td className="px-4 py-3 text-sm">{item.itemName || item.description}</td>
                                                    <td className="px-4 py-3 text-center text-sm">{item.quantity}</td>
                                                    <td className="px-4 py-3 text-right text-sm">₹{item.unitPrice.toLocaleString()}</td>
                                                    <td className="px-4 py-3 text-right text-sm font-semibold">₹{item.totalAmount.toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    {/* Totals */}
                                    <div className="flex justify-end">
                                        <div className="w-64">
                                            <div className="flex justify-between py-2">
                                                <span className="text-gray-600">Subtotal:</span>
                                                <span className="font-semibold">₹{order.subtotal.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between py-2">
                                                <span className="text-gray-600">Tax:</span>
                                                <span className="font-semibold">₹{order.taxAmount.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between py-3 border-t-2 border-gray-300">
                                                <span className="text-lg font-bold">Total:</span>
                                                <span className="text-lg font-bold text-blue-600">₹{order.totalAmount.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Sidebar */}
                <div className="space-y-3">
                    {/* Status Cards */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Delivery</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2 mb-2">
                                <Truck className="h-5 w-5 text-orange-600" />
                                <span className="font-semibold text-orange-600">{order.status}</span>
                            </div>
                            <div className="text-sm text-gray-600">
                                Expected: <span className="font-medium text-gray-900">{(order.deliveryDate || '').split('T')[0]}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Terms</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircle className="h-5 w-5 text-gray-400" />
                                <span className="font-semibold text-gray-600">{order.paymentTerms}</span>
                            </div>
                            <Button variant="outline" className="w-full text-sm">Record Bill</Button>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button className="w-full" variant="outline">
                                Create GRN
                            </Button>
                            {order.status !== 'Cancelled' && order.status !== 'Closed' && (
                                <Button
                                    className="w-full"
                                    variant="outline"
                                    onClick={handleClose}
                                    disabled={busyAction !== null}
                                >
                                    <RotateCcw className="mr-2 h-4 w-4" />
                                    {busyAction === 'close' ? 'Closing…' : 'Close Order'}
                                </Button>
                            )}
                            {order.status !== 'Cancelled' && order.status !== 'Closed' && (
                                <Button
                                    className="w-full text-red-600"
                                    variant="outline"
                                    onClick={handleCancel}
                                    disabled={busyAction !== null}
                                >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    {busyAction === 'cancel' ? 'Cancelling…' : 'Cancel Order'}
                                </Button>
                            )}
                            <Button
                                className="w-full"
                                variant="outline"
                                onClick={() => router.push(`/procurement/orders/edit/${orderId}`)}
                            >
                                Edit
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
