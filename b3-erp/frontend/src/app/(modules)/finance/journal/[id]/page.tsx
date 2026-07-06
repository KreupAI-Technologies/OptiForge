'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FinanceService } from '@/services/finance.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, Printer, FileText, AlertCircle } from 'lucide-react';

export default function JournalEntryDetailPage() {
    const params = useParams();
    const router = useRouter();
    const journalId = params.id as string;

    const [record, setRecord] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        if (!journalId) {
            setIsLoading(false);
            return;
        }
        (async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const data = await FinanceService.getJournalEntry(journalId);
                if (!cancelled) setRecord(data);
            } catch (err: any) {
                if (!cancelled) setLoadError(err?.message || 'Failed to load journal entry');
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [journalId]);

    const r: any = record ?? {};
    const journal = {
        id: r.id ?? journalId,
        number: r.number ?? r.entryNumber ?? journalId,
        date: r.date ?? r.entryDate ?? '',
        reference: r.reference ?? r.referenceNumber ?? '',
        description: r.description ?? '',
        type: r.type ?? r.entryType ?? 'General Journal',
        status: r.status ?? 'Draft',
        postedBy: r.postedBy ?? '',
        postedDate: r.postedDate ?? '',
        lines: Array.isArray(r.lines)
            ? r.lines.map((l: any) => ({
                  account: l.account ?? l.accountName ?? '',
                  description: l.description ?? '',
                  debit: Number(l.debit ?? l.debitAmount ?? 0),
                  credit: Number(l.credit ?? l.creditAmount ?? 0),
              }))
            : [],
        total: Number(
            r.total ??
                r.totalDebit ??
                (Array.isArray(r.lines)
                    ? r.lines.reduce((s: number, l: any) => s + Number(l.debit ?? l.debitAmount ?? 0), 0)
                    : 0),
        ),
    };

    return (
        <div className="w-full p-3">
            {isLoading && (
                <div className="mb-3 bg-blue-50 border border-blue-200 rounded-lg p-2 text-sm text-blue-700">
                    Loading…
                </div>
            )}
            {loadError && !isLoading && (
                <div className="mb-3 bg-red-50 border border-red-200 rounded-lg p-2 text-sm text-red-700 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {loadError}
                </div>
            )}
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
                        <h1 className="text-3xl font-bold">Journal Entry {journal.number}</h1>
                        <Badge className="bg-green-600">{journal.status}</Badge>
                    </div>
                    <p className="text-gray-600 mt-1">
                        Date: {journal.date} | Ref: {journal.reference}
                    </p>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline">
                        <Printer className="mr-2 h-4 w-4" />
                        Print
                    </Button>
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Export PDF
                    </Button>
                </div>
            </div>

            {/* Journal Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {/* Main Entry Details */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Entry Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-3">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
                                <p className="text-lg">{journal.description}</p>
                            </div>

                            {/* Lines Table */}
                            <table className="w-full mb-3 border rounded-lg overflow-hidden">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Account</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Description</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Debit</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Credit</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {journal.lines.map((line: any, idx: number) => (
                                        <tr key={idx}>
                                            <td className="px-4 py-3 text-sm font-medium">{line.account}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{line.description}</td>
                                            <td className="px-4 py-3 text-right text-sm">
                                                {line.debit > 0 ? `₹${line.debit.toLocaleString()}` : '-'}
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm">
                                                {line.credit > 0 ? `₹${line.credit.toLocaleString()}` : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                    <tr className="bg-gray-50 font-bold">
                                        <td className="px-4 py-3" colSpan={2}>Total</td>
                                        <td className="px-4 py-3 text-right">₹{journal.total.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-right">₹{journal.total.toLocaleString()}</td>
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
                            <CardTitle>Entry Info</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-600">Type:</span>
                                <span className="font-medium">{journal.type}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-600">Posted By:</span>
                                <span className="font-medium">{journal.postedBy}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-600">Posted Date:</span>
                                <span className="font-medium">{journal.postedDate}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Related Documents</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2 text-sm text-gray-500 italic">
                                <FileText className="w-4 h-4" />
                                No related documents attached
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
