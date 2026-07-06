'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, Printer, Mail, CheckCircle } from 'lucide-react';
import { InvoiceService, Invoice, InvoiceStatus } from '@/services/invoice.service';

export default function InvoiceDetailPage() {
    const params = useParams();
    const router = useRouter();
    const invoiceId = params.id as string;

    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                setLoading(true);
                const data = await InvoiceService.getInvoiceById(invoiceId);
                if (active) setInvoice(data);
            } catch (err) {
                if (active) setError(err instanceof Error ? err.message : 'Failed to load invoice');
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => { active = false; };
    }, [invoiceId]);

    const formatDate = (d?: Date | string) => {
        if (!d) return '-';
        const date = typeof d === 'string' ? new Date(d) : d;
        return isNaN(date.getTime()) ? '-' : date.toISOString().split('T')[0];
    };
    const money = (n?: number) => `₹${(n ?? 0).toLocaleString()}`;

    if (loading) {
        return <div className="w-full px-4 py-6 text-gray-600">Loading invoice…</div>;
    }
    if (error || !invoice) {
        return (
            <div className="w-full px-4 py-6">
                <Button variant="ghost" onClick={() => router.back()} className="mb-3">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <p className="text-red-600">{error || 'Invoice not found.'}</p>
            </div>
        );
    }

    const lineItems = invoice.lineItems ?? [];
    const isPaid = invoice.status === InvoiceStatus.PAID;
    const amountPaid = invoice.amountPaid ?? 0;

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
                        <h1 className="text-3xl font-bold">Invoice {invoice.invoiceNumber}</h1>
                        <Badge className={isPaid ? 'bg-green-600' : 'bg-orange-600'}>
                            {invoice.status}
                        </Badge>
                    </div>
                    <p className="text-gray-600 mt-1">
                        Issued: {formatDate(invoice.invoiceDate)} | Due: {formatDate(invoice.dueDate)}
                    </p>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => window.print()}>
                        <Printer className="mr-2 h-4 w-4" />
                        Print
                    </Button>
                    <Button variant="outline" onClick={() => { if (invoice.customerEmail) window.location.href = `mailto:${invoice.customerEmail}`; }}>
                        <Mail className="mr-2 h-4 w-4" />
                        Email
                    </Button>
                    <Button variant="outline" onClick={() => window.print()}>
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                    </Button>
                </div>
            </div>

            {/* Invoice Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {/* Main Invoice */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Invoice Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {/* Customer Info */}
                            <div className="mb-3 pb-6 border-b">
                                <h3 className="font-semibold mb-2">Bill To:</h3>
                                <p className="font-medium">{invoice.customerName}</p>
                                {invoice.customerAddress && (
                                    <p className="text-sm text-gray-600">{invoice.customerAddress}</p>
                                )}
                                {invoice.customerEmail && (
                                    <p className="text-sm text-gray-600">{invoice.customerEmail}</p>
                                )}
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
                                    {lineItems.map((item, idx) => (
                                        <tr key={item.id ?? idx}>
                                            <td className="px-4 py-3 text-sm">{item.productName || item.description}</td>
                                            <td className="px-4 py-3 text-center text-sm">{item.quantity}</td>
                                            <td className="px-4 py-3 text-right text-sm">{money(item.unitPrice)}</td>
                                            <td className="px-4 py-3 text-right text-sm font-semibold">{money(item.lineTotal)}</td>
                                        </tr>
                                    ))}
                                    {lineItems.length === 0 && (
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
                                        <span className="font-semibold">{money(invoice.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between py-2">
                                        <span className="text-gray-600">Tax:</span>
                                        <span className="font-semibold">{money(invoice.totalTax)}</span>
                                    </div>
                                    <div className="flex justify-between py-3 border-t-2 border-gray-300">
                                        <span className="text-lg font-bold">Total:</span>
                                        <span className="text-lg font-bold text-green-600">{money(invoice.totalAmount)}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-3">
                    {/* Payment Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircle className={`h-5 w-5 ${isPaid ? 'text-green-600' : 'text-orange-600'}`} />
                                <span className={`font-semibold ${isPaid ? 'text-green-600' : 'text-orange-600'}`}>
                                    {isPaid ? 'Paid in Full' : invoice.status}
                                </span>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Amount Paid:</span>
                                    <span className="font-medium text-green-600">{money(amountPaid)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Amount Due:</span>
                                    <span className="font-medium">{money(invoice.amountDue)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button className="w-full" variant="outline" onClick={() => router.push(`/sales/invoices/${invoiceId}#payment`)}>
                                Record Payment
                            </Button>
                            <Button className="w-full" variant="outline" onClick={() => { if (invoice.customerEmail) window.location.href = `mailto:${invoice.customerEmail}`; }}>
                                Send Reminder
                            </Button>
                            <Button className="w-full" variant="outline" onClick={() => router.push('/sales/invoices/credit-notes')}>
                                Create Credit Note
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Related Documents */}
                    {(invoice.poNumber || invoice.reference) && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Related Documents</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 text-sm">
                                    {invoice.poNumber && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">PO Number:</span>
                                            <span className="font-medium">{invoice.poNumber}</span>
                                        </div>
                                    )}
                                    {invoice.reference && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Reference:</span>
                                            <span className="font-medium">{invoice.reference}</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
