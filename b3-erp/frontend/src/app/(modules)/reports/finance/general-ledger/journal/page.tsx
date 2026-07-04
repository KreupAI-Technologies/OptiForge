'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ReportDetailPage } from '@/components/reports/ReportDetailPage';
import { fetchDomainList } from '@/services/reports-data.service';
import { ClickableTableRow } from '@/components/reports/ClickableTableRow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function JournalEntryContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get('id') || 'Unknown';

    // Mock data for a balanced journal entry
    const [entryLines, setEntryLines] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true); setLoadError(null);
            try {
                const raw = await fetchDomainList<any>('finance/journal-entries');
                const mapped = raw.map((r: any) => ({ id: r.entryNumber ?? r.id, accountCode: r.referenceNumber ?? '', accountName: r.narration ?? '', debit: Number(r.totalDebit ?? 0), credit: Number(r.totalCredit ?? 0), description: r.description ?? r.narration ?? '' }));
                if (!cancelled) setEntryLines(mapped);
            } catch (e) {
                if (!cancelled) { setLoadError(e instanceof Error ? e.message : 'Failed to load'); setEntryLines([]); }
            } finally { if (!cancelled) setIsLoading(false); }
        })();
        return () => { cancelled = true; };
    }, []);

    const totalDebit = entryLines.reduce((sum, line) => sum + line.debit, 0);
    const totalCredit = entryLines.reduce((sum, line) => sum + line.credit, 0);

    return (
        <ReportDetailPage
            title={`Journal Entry: ${id}`}
            description={`Details for journal entry ${id}`}
            breadcrumbs={[
                { label: 'Reports', href: '/reports' },
                { label: 'Finance', href: '/reports' },
                { label: 'General Ledger', href: '/reports/finance/general-ledger' },
                { label: 'Journal Entry' }
            ]}
        >
            {isLoading && <div className="mb-3 rounded border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">Loading…</div>}
            {loadError && !isLoading && <div className="mb-3 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{loadError}</div>}
            <Card>
                <CardHeader>
                    <CardTitle>Entry Details</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Code</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Name</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Debit</th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Credit</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {entryLines.map((line) => (
                                <ClickableTableRow
                                    key={line.id}
                                    onClick={() => router.push(`/accounts/ledger/${line.accountCode}`)}
                                >
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{line.accountCode}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{line.accountName}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{line.description}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-900">
                                        {line.debit > 0 ? `₹${line.debit.toLocaleString()}` : '-'}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-900">
                                        {line.credit > 0 ? `₹${line.credit.toLocaleString()}` : '-'}
                                    </td>
                                </ClickableTableRow>
                            ))}
                            <tr className="bg-gray-50 font-bold">
                                <td className="px-3 py-2" colSpan={3}>Total</td>
                                <td className="px-3 py-2 text-right text-blue-600">₹{totalDebit.toLocaleString()}</td>
                                <td className="px-3 py-2 text-right text-green-600">₹{totalCredit.toLocaleString()}</td>
                            </tr>
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </ReportDetailPage>
    );
}

export default function JournalEntryPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <JournalEntryContent />
        </Suspense>
    );
}
