'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { FinanceService, ExpenseClaimDetail } from '@/services/finance.service';

function formatDate(value?: string | null): string {
    if (!value) return '—';
    const d = new Date(value);
    return isNaN(d.getTime()) ? String(value) : d.toISOString().slice(0, 10);
}

function toMoney(value?: number | string): number {
    const n = typeof value === 'string' ? parseFloat(value) : value;
    return Number.isFinite(n as number) ? (n as number) : 0;
}

export default function ExpenseClaimDetailPage() {
    const params = useParams();
    const router = useRouter();
    const claimId = params.id as string;

    const [claim, setClaim] = useState<ExpenseClaimDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError(null);
        FinanceService.getExpenseClaim(claimId)
            .then((data) => {
                if (active) setClaim(data);
            })
            .catch((e) => {
                if (active) setError(e?.message || 'Failed to load expense claim');
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, [claimId]);

    const status = claim?.status ?? '';
    const normalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

    const getStatusBadge = () => {
        switch (status.toLowerCase()) {
            case 'approved':
                return <Badge className="bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
            case 'paid':
                return <Badge className="bg-green-700"><CheckCircle className="w-3 h-3 mr-1" />Paid</Badge>;
            case 'rejected':
                return <Badge className="bg-red-600"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
            case 'pending':
                return <Badge className="bg-orange-600"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
            default:
                return <Badge variant="outline">{normalizedStatus || 'Draft'}</Badge>;
        }
    };

    if (loading) {
        return (
            <div className="w-full p-3 flex items-center justify-center min-h-[40vh]">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400 mr-2" />
                <span className="text-gray-600">Loading expense claim…</span>
            </div>
        );
    }

    if (error || !claim) {
        return (
            <div className="w-full p-3">
                <Button variant="ghost" onClick={() => router.back()} className="mb-3">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                <Card>
                    <CardContent className="py-10 text-center">
                        <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                        <p className="font-medium">{error || 'Expense claim not found'}</p>
                        <p className="text-sm text-gray-500 mt-1">Claim ID: {claimId}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const amount = toMoney(claim.totalAmount);
    const items = [
        {
            date: formatDate(claim.claimDate),
            description: claim.description || '—',
            category: claim.category || 'General',
            amount,
        },
    ];

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
                        <h1 className="text-3xl font-bold">Expense Claim {claim.claimNumber || claim.id}</h1>
                        {getStatusBadge()}
                    </div>
                    <p className="text-gray-600 mt-1">
                        Submitted: {formatDate(claim.claimDate)} | Employee: {claim.employeeName || '—'}
                    </p>
                </div>

                <div className="flex gap-2">
                    {status.toLowerCase() === 'pending' && (
                        <>
                            <Button className="bg-green-600">
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Approve
                            </Button>
                            <Button variant="destructive">
                                <XCircle className="mr-2 h-4 w-4" />
                                Reject
                            </Button>
                        </>
                    )}
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                    </Button>
                </div>
            </div>

            {/* Claim Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {/* Main Claim Details */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Expense Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {/* Employee Info */}
                            <div className="mb-3 pb-6 border-b">
                                <h3 className="font-semibold mb-2">Employee Information:</h3>
                                <p className="font-medium">{claim.employeeName || '—'}</p>
                                <p className="text-sm text-gray-600">ID: {claim.employeeId || '—'}</p>
                            </div>

                            {/* Expense Items */}
                            <table className="w-full mb-3">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Description</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Category</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {items.map((item, idx) => (
                                        <tr key={idx}>
                                            <td className="px-4 py-3 text-sm">{item.date}</td>
                                            <td className="px-4 py-3 text-sm">{item.description}</td>
                                            <td className="px-4 py-3 text-sm">
                                                <Badge variant="outline">{item.category}</Badge>
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm font-semibold">₹{item.amount.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Total */}
                            <div className="flex justify-end">
                                <div className="w-64">
                                    <div className="flex justify-between py-3 border-t-2 border-gray-300">
                                        <span className="text-lg font-bold">Total Amount:</span>
                                        <span className="text-lg font-bold text-green-600">₹{amount.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-3">
                    {/* Approval Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Approval Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {(status.toLowerCase() === 'approved' || status.toLowerCase() === 'paid') ? (
                                <>
                                    <div className="flex items-center gap-2 mb-2">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                        <span className="font-semibold text-green-600">{normalizedStatus}</span>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Approved By:</span>
                                            <span className="font-medium">{claim.approvedBy || '—'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Approved Date:</span>
                                            <span className="font-medium">{formatDate(claim.approvedDate)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Reimbursed:</span>
                                            <span className="font-medium text-green-600">{formatDate(claim.paidDate)}</span>
                                        </div>
                                    </div>
                                </>
                            ) : status.toLowerCase() === 'rejected' ? (
                                <div className="text-sm">
                                    <div className="flex items-center gap-2 mb-2">
                                        <XCircle className="h-5 w-5 text-red-600" />
                                        <span className="font-semibold text-red-600">Rejected</span>
                                    </div>
                                    <p className="text-gray-600">{claim.rejectionReason || 'No reason provided'}</p>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Clock className="h-5 w-5 text-orange-500" />
                                    <span>{normalizedStatus || 'Draft'}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Claim Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Claim Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Category:</span>
                                <span className="font-medium">{claim.category || '—'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Submitted On:</span>
                                <span className="font-medium">{formatDate(claim.claimDate)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Total Amount:</span>
                                <span className="font-medium text-green-600">₹{amount.toLocaleString()}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
