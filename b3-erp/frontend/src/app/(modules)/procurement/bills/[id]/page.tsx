'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, Printer, Calendar, DollarSign } from 'lucide-react';
import { procurementPurchaseInvoiceService } from '@/services/procurement-purchase-invoice.service';

interface BillItem {
    description: string;
    quantity: number;
    rate: number;
    amount: number;
}

interface Bill {
    id: string;
    number: string;
    vendor: { name: string; id: string; address: string };
    date: string;
    dueDate: string;
    status: string;
    items: BillItem[];
    subtotal: number;
    tax: number;
    total: number;
    balanceDue: number;
}

export default function PurchaseBillDetailPage() {
    const params = useParams();
    const router = useRouter();
    const billId = params.id as string;

    const [bill, setBill] = useState<Bill | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [notFound, setNotFound] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setIsLoading(true);
            setLoadError(null);
            setNotFound(false);
            try {
                const raw = await procurementPurchaseInvoiceService.getInvoiceById(billId);
                if (cancelled) return;
                if (!raw || !(raw.id || raw.invoiceNumber)) {
                    setNotFound(true);
                    return;
                }
                const items: BillItem[] = Array.isArray(raw.items)
                    ? raw.items.map((it: any) => ({
                        description: it.itemName ?? it.description ?? '',
                        quantity: Number(it.quantity ?? 0),
                        rate: Number(it.unitPrice ?? it.rate ?? 0),
                        amount: Number(it.totalAmount ?? it.amount ?? 0),
                    }))
                    : [];
                const total = Number(raw.totalAmount ?? raw.total ?? 0);
                setBill({
                    id: raw.id ?? billId,
                    number: raw.invoiceNumber ?? billId,
                    vendor: {
                        name: raw.vendorName ?? '',
                        id: raw.vendorId ?? '',
                        address: raw.vendorAddress ?? '',
                    },
                    date: (raw.invoiceDate ?? raw.date ?? '')?.toString().slice(0, 10),
                    dueDate: (raw.dueDate ?? '')?.toString().slice(0, 10),
                    status: raw.status ?? '',
                    items,
                    subtotal: Number(raw.subtotal ?? 0),
                    tax: Number(raw.taxAmount ?? raw.tax ?? 0),
                    total,
                    balanceDue: Number(raw.balanceDue ?? raw.amountDue ?? total),
                });
            } catch (err) {
                if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Failed to load bill');
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, [billId, reloadKey]);

    if (isLoading) {
        return (
            <div className="w-full p-3">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">Loading bill...</div>
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="w-full p-3">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 flex items-center justify-between">
                    <span>{loadError}</span>
                    <button
                        onClick={() => setReloadKey((k) => k + 1)}
                        className="ml-3 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (notFound || !bill) {
        return (
            <div className="w-full p-3">
                <Button variant="ghost" onClick={() => router.back()} className="mb-2">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-700">Bill not found.</div>
            </div>
        );
    }

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
                        <h1 className="text-3xl font-bold">Bill {bill.number}</h1>
                        <Badge className="bg-orange-600">{bill.status}</Badge>
                    </div>
                    <p className="text-gray-600 mt-1">
                        Vendor: {bill.vendor.name} | Date: {bill.date}
                    </p>
                </div>

                <div className="flex gap-2">
                    <Button>
                        <DollarSign className="mr-2 h-4 w-4" />
                        Record Payment
                    </Button>
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        PDF
                    </Button>
                </div>
            </div>

            {/* Bill Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Bill Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-3 pb-6 border-b">
                                <h3 className="font-semibold mb-2">Vendor Details:</h3>
                                <p className="font-medium">{bill.vendor.name}</p>
                                <p className="text-sm text-gray-600">{bill.vendor.address}</p>
                                <p className="text-sm text-gray-600">ID: {bill.vendor.id}</p>
                            </div>

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
                                    {bill.items.map((item, idx) => (
                                        <tr key={idx}>
                                            <td className="px-4 py-3 text-sm">{item.description}</td>
                                            <td className="px-4 py-3 text-center text-sm">{item.quantity}</td>
                                            <td className="px-4 py-3 text-right text-sm">₹{item.rate.toLocaleString()}</td>
                                            <td className="px-4 py-3 text-right text-sm font-semibold">₹{item.amount.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="flex justify-end">
                                <div className="w-64">
                                    <div className="flex justify-between py-2">
                                        <span className="text-gray-600">Subtotal:</span>
                                        <span className="font-semibold">₹{bill.subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between py-2">
                                        <span className="text-gray-600">Tax (18%):</span>
                                        <span className="font-semibold">₹{bill.tax.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between py-3 border-t-2 border-gray-300">
                                        <span className="text-lg font-bold">Total:</span>
                                        <span className="text-lg font-bold text-blue-600">₹{bill.total.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-4">
                                <p className="text-sm text-gray-600 mb-1">Balance Due</p>
                                <p className="text-3xl font-bold text-red-600">₹{bill.balanceDue.toLocaleString()}</p>
                                <div className="flex items-center justify-center gap-2 mt-4 text-sm text-orange-600">
                                    <Calendar className="w-4 h-4" />
                                    Due by {bill.dueDate}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
